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
public class DiscountRuleDto {
    private Long discountRuleId;
    private String ruleName;
    private String feeType;
    private Long academyFeePlanId;
    private Long libraryFeePlanId;
    private String discountType;
    private BigDecimal discountValue;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Boolean isActive;
}
