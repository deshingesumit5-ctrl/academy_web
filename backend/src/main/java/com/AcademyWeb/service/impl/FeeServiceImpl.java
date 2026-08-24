package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.FeePaymentDto;
import com.AcademyWeb.dto.StudentFeeStructureDto;
import com.AcademyWeb.entity.FeePayment;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.entity.AcademyFeePlan;
import com.AcademyWeb.entity.LibraryFeePlan;
import com.AcademyWeb.repository.AcademyFeePlanRepository;
import com.AcademyWeb.repository.LibraryFeePlanRepository;
import com.AcademyWeb.repository.FeePaymentRepository;
import com.AcademyWeb.repository.StudentRepository;
import com.AcademyWeb.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FeeServiceImpl implements FeeService {

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AcademyFeePlanRepository academyFeePlanRepository;

    @Autowired
    private LibraryFeePlanRepository libraryFeePlanRepository;

    private FeePaymentDto mapToDto(FeePayment entity) {
        return FeePaymentDto.builder()
                .paymentId(entity.getPaymentId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getStudentId() : null)
                .studentName(entity.getStudent() != null ? entity.getStudent().getStudentName() : null)
                .admissionNumber(entity.getStudent() != null ? entity.getStudent().getAdmissionNumber() : null)
                .amountPaid(entity.getAmountPaid())
                .paymentMode(entity.getPaymentMode())
                .paymentType(entity.getPaymentType())
                .paymentDate(entity.getPaymentDate())
                .status(entity.getStatus())
                .receiptNumber(entity.getReceiptNumber())
                .remarks(entity.getRemarks())
                .build();
    }

    @Override
    public List<FeePaymentDto> getAllPayments() {
        return feePaymentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFeeStructureDto> getStudentFeeStructures() {
        List<Student> students = studentRepository.findAllByOrderByStudentIdDesc();
        
        List<Object[]> paidRows = feePaymentRepository.sumAmountPaidGroupByStudent();
        Map<Long, BigDecimal> paidMap = new HashMap<>();
        for (Object[] row : paidRows) {
            if (row[0] != null && row[1] != null) {
                paidMap.put((Long) row[0], (BigDecimal) row[1]);
            }
        }

        return students.stream().map(student -> {
            String rawAdmissionType = student.getAdmissionType();
            String admissionType = "Academy";
            boolean isAcademy = false;
            boolean isLibrary = false;

            if (rawAdmissionType != null && !rawAdmissionType.trim().isEmpty()) {
                String typeNorm = rawAdmissionType.trim().toUpperCase();
                if (typeNorm.contains("ACADEMY_LIBRARY") || typeNorm.contains("ACADEMY + LIBRARY") || typeNorm.contains("ACADEMY+LIBRARY") || typeNorm.contains("ACADEMY & LIBRARY")) {
                    admissionType = "Academy + Library";
                    isAcademy = true;
                    isLibrary = true;
                } else if (typeNorm.contains("LIBRARY")) {
                    admissionType = "Library";
                    isLibrary = true;
                } else if (typeNorm.contains("ACADEMY")) {
                    admissionType = "Academy";
                    isAcademy = true;
                } else {
                    admissionType = rawAdmissionType;
                    isAcademy = (student.getCourse() != null);
                    isLibrary = (student.getLibraryPlan() != null);
                    if (!isAcademy && !isLibrary) {
                        isAcademy = true;
                    }
                }
            } else {
                isAcademy = (student.getCourse() != null);
                isLibrary = (student.getLibraryPlan() != null);
                if (!isAcademy && !isLibrary) {
                    isAcademy = true;
                }
                admissionType = isAcademy && isLibrary ? "Academy + Library" : (isLibrary ? "Library" : "Academy");
            }

            BigDecimal courseFee = BigDecimal.ZERO;
            if (isAcademy) {
                if (student.getCourse() != null) {
                    AcademyFeePlan plan = academyFeePlanRepository.findByCourseCourseId(student.getCourse().getCourseId()).orElse(null);
                    if (plan == null && student.getCourse().getCourseName() != null) {
                        plan = academyFeePlanRepository.findByPlanNameIgnoreCase(student.getCourse().getCourseName().trim()).orElse(null);
                    }
                    if (plan != null && plan.getTotalFee() != null) {
                        courseFee = plan.getTotalFee();
                    } else if (student.getCourse().getFees() != null) {
                        courseFee = student.getCourse().getFees();
                    }
                } else if (student.getLibraryPlan() != null) {
                    AcademyFeePlan plan = academyFeePlanRepository.findByPlanNameIgnoreCase(student.getLibraryPlan().getPlanName().trim()).orElse(null);
                    if (plan != null && plan.getTotalFee() != null) {
                        courseFee = plan.getTotalFee();
                    }
                }
            }

            BigDecimal planFee = BigDecimal.ZERO;
            if (isLibrary) {
                if (student.getLibraryPlan() != null) {
                    LibraryFeePlan lPlan = libraryFeePlanRepository.findByLibraryPlanPlanId(student.getLibraryPlan().getPlanId()).orElse(null);
                    if (lPlan == null && student.getLibraryPlan().getPlanName() != null) {
                        lPlan = libraryFeePlanRepository.findByPlanNameIgnoreCase(student.getLibraryPlan().getPlanName().trim()).orElse(null);
                    }
                    if (lPlan != null && lPlan.getTotalFee() != null) {
                        planFee = lPlan.getTotalFee();
                    } else if (student.getLibraryPlan().getFees() != null) {
                        planFee = student.getLibraryPlan().getFees();
                    }
                }
                if (planFee.compareTo(BigDecimal.ZERO) == 0 && student.getCourse() != null && student.getCourse().getCourseName() != null) {
                    LibraryFeePlan lPlan = libraryFeePlanRepository.findByPlanNameIgnoreCase(student.getCourse().getCourseName().trim()).orElse(null);
                    if (lPlan != null && lPlan.getTotalFee() != null) {
                        planFee = lPlan.getTotalFee();
                    }
                }
            }

            BigDecimal totalFee = courseFee.add(planFee);
            BigDecimal discountAmt = student.getDiscountAmount() != null ? student.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal concessionAmt = student.getConcessionAmount() != null ? student.getConcessionAmount() : BigDecimal.ZERO;
            BigDecimal finalFee = totalFee.subtract(discountAmt).subtract(concessionAmt);
            if (finalFee.compareTo(BigDecimal.ZERO) < 0) {
                finalFee = BigDecimal.ZERO;
            }
            
            BigDecimal paidAmount = paidMap.getOrDefault(student.getStudentId(), BigDecimal.ZERO);
            BigDecimal remainingAmount = finalFee.subtract(paidAmount);
            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                remainingAmount = BigDecimal.ZERO;
            }

            String courseOrPlanName = "-";
            if (student.getCourse() != null && student.getLibraryPlan() != null) {
                courseOrPlanName = student.getCourse().getCourseName() + " & " + student.getLibraryPlan().getPlanName();
            } else if (student.getCourse() != null) {
                courseOrPlanName = student.getCourse().getCourseName();
            } else if (student.getLibraryPlan() != null) {
                courseOrPlanName = student.getLibraryPlan().getPlanName();
            }

            String batchName = student.getBatch() != null ? student.getBatch().getBatchName() : "-";
            
            String status = student.getStatus() != null ? student.getStatus() : "Active";
            if (finalFee.compareTo(BigDecimal.ZERO) > 0 && remainingAmount.compareTo(BigDecimal.ZERO) == 0) {
                status = "Completed";
            }

            return StudentFeeStructureDto.builder()
                    .studentId(student.getStudentId())
                    .admissionNumber(student.getAdmissionNumber())
                    .studentName(student.getStudentName())
                    .mobileNumber(student.getMobileNumber())
                    .admissionType(admissionType)
                    .courseName(courseOrPlanName)
                    .planName(student.getLibraryPlan() != null ? student.getLibraryPlan().getPlanName() : null)
                    .batchName(batchName)
                    .totalFee(totalFee)
                    .discountAmount(discountAmt)
                    .concessionAmount(concessionAmt)
                    .finalFee(finalFee)
                    .paidAmount(paidAmount)
                    .remainingAmount(remainingAmount)
                    .status(status)
                    .rollNumber(student.getRollNumber())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<FeePaymentDto> getPaymentHistoryByStudent(Long studentId) {
        return feePaymentRepository.findByStudentStudentIdOrderByPaymentDateAscPaymentIdAsc(studentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FeePaymentDto recordPayment(FeePaymentDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String receiptNo = dto.getReceiptNumber() != null && !dto.getReceiptNumber().trim().isEmpty()
                ? dto.getReceiptNumber().trim()
                : "REC" + System.currentTimeMillis() % 100000;

        String paymentType = dto.getPaymentType() != null && !dto.getPaymentType().trim().isEmpty()
                ? dto.getPaymentType().trim()
                : "Installment";

        FeePayment payment = FeePayment.builder()
                .student(student)
                .amountPaid(dto.getAmountPaid())
                .paymentMode(dto.getPaymentMode() != null ? dto.getPaymentMode() : "UPI")
                .paymentType(paymentType)
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "Paid")
                .receiptNumber(receiptNo)
                .remarks(dto.getRemarks())
                .build();

        FeePayment saved = feePaymentRepository.save(payment);
        return mapToDto(saved);
    }
}
