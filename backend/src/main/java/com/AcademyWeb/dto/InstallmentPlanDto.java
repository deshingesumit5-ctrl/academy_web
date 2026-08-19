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
public class InstallmentPlanDto {
    private Long installmentPlanId;
    private String feeType;
    private Long academyFeePlanId;
    private Long libraryFeePlanId;
    private Integer numInstallments;
    private BigDecimal installmentAmount;
    private Integer installmentNumber;
    private LocalDate dueDate;
}
