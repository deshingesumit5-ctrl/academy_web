package com.AcademyWeb.service;

import com.AcademyWeb.dto.*;
import java.util.List;

public interface FeeStructureService {
    FeeStructureDto getFeeStructure();
    
    AcademyFeePlanDto createAcademyFeePlan(AcademyFeePlanDto dto);
    LibraryFeePlanDto createLibraryFeePlan(LibraryFeePlanDto dto);
    InstallmentPlanDto createInstallmentPlan(InstallmentPlanDto dto);
    DiscountRuleDto createDiscountRule(DiscountRuleDto dto);

    AcademyFeePlanDto updateAcademyFeePlan(Long id, AcademyFeePlanDto dto);

    void deleteAcademyFeePlan(Long id);
    void deleteLibraryFeePlan(Long id);
    void deleteInstallmentPlan(Long id);
    void deleteDiscountRule(Long id);
}
