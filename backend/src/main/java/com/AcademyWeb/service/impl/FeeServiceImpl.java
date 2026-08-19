package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.FeePaymentDto;
import com.AcademyWeb.entity.FeePayment;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.FeePaymentRepository;
import com.AcademyWeb.repository.StudentRepository;
import com.AcademyWeb.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
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
    public FeePaymentDto recordPayment(FeePaymentDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        String receiptNo = "REC" + System.currentTimeMillis() % 100000;

        FeePayment payment = FeePayment.builder()
                .student(student)
                .amountPaid(dto.getAmountPaid())
                .paymentMode(dto.getPaymentMode())
                .paymentType(dto.getPaymentType())
                .paymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "Paid")
                .receiptNumber(receiptNo)
                .remarks(dto.getRemarks())
                .build();

        FeePayment saved = feePaymentRepository.save(payment);
        return mapToDto(saved);
    }
}
