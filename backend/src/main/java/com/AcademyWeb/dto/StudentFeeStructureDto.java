package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentFeeStructureDto {
    private Long studentId;
    private String admissionNumber;
    private String studentName;
    private String mobileNumber;
    private String admissionType;
    private String courseName;
    private String planName;
    private String batchName;
    private BigDecimal totalFee;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
}
