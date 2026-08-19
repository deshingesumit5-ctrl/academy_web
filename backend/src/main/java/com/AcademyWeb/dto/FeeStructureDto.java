package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeStructureDto {
    private List<AcademyFeePlanDto> academyFeePlans;
    private List<LibraryFeePlanDto> libraryFeePlans;
    private List<InstallmentPlanDto> installmentPlans;
    private List<DiscountRuleDto> discountRules;
}
