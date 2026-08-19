package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeePaymentDto {
    private Long paymentId;
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private BigDecimal amountPaid;
    private String paymentMode;
    private String paymentType;
    private LocalDate paymentDate;
    private String status;
    private String receiptNumber;
    private String remarks;
}
