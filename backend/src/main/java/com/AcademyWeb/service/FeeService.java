package com.AcademyWeb.service;

import com.AcademyWeb.dto.FeePaymentDto;
import java.util.List;

public interface FeeService {
    List<FeePaymentDto> getAllPayments();
    FeePaymentDto recordPayment(FeePaymentDto dto);
}
