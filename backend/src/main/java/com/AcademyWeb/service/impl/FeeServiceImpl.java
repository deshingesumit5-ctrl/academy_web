package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.FeePaymentDto;
import com.AcademyWeb.dto.StudentFeeStructureDto;
import com.AcademyWeb.entity.FeePayment;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
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
            BigDecimal courseFee = student.getCourse() != null && student.getCourse().getFees() != null
                    ? student.getCourse().getFees() : BigDecimal.ZERO;
            BigDecimal planFee = student.getLibraryPlan() != null && student.getLibraryPlan().getFees() != null
                    ? student.getLibraryPlan().getFees() : BigDecimal.ZERO;
            BigDecimal totalFee = courseFee.add(planFee);
            
            BigDecimal paidAmount = paidMap.getOrDefault(student.getStudentId(), BigDecimal.ZERO);
            BigDecimal remainingAmount = totalFee.subtract(paidAmount);
            if (remainingAmount.compareTo(BigDecimal.ZERO) < 0) {
                remainingAmount = BigDecimal.ZERO;
            }

            String admissionType = student.getAdmissionType();
            if ("ACADEMY_LIBRARY".equalsIgnoreCase(admissionType) || "Academy + Library".equalsIgnoreCase(admissionType)) {
                admissionType = "Academy + Library";
            } else if ("ACADEMY".equalsIgnoreCase(admissionType)) {
                admissionType = "Academy";
            } else if ("LIBRARY".equalsIgnoreCase(admissionType)) {
                admissionType = "Library";
            } else if (admissionType == null) {
                admissionType = "Academy";
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
            if (totalFee.compareTo(BigDecimal.ZERO) > 0 && remainingAmount.compareTo(BigDecimal.ZERO) == 0) {
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
                    .paidAmount(paidAmount)
                    .remainingAmount(remainingAmount)
                    .status(status)
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
