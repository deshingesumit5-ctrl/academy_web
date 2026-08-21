package com.AcademyWeb.service;

import com.AcademyWeb.dto.FeePaymentDto;
import com.AcademyWeb.dto.StudentFeeStructureDto;
import java.util.List;

public interface FeeService {
    List<FeePaymentDto> getAllPayments();
    FeePaymentDto recordPayment(FeePaymentDto dto);
    List<StudentFeeStructureDto> getStudentFeeStructures();
    List<FeePaymentDto> getPaymentHistoryByStudent(Long studentId);
}
