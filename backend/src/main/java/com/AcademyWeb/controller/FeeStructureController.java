package com.AcademyWeb.controller;

import com.AcademyWeb.dto.*;
import com.AcademyWeb.service.FeeStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fee-structures")
public class FeeStructureController {

    @Autowired
    private FeeStructureService feeStructureService;

    @GetMapping
    public ResponseEntity<ApiResponse<FeeStructureDto>> getFeeStructure() {
        return ResponseEntity.ok(ApiResponse.success("Fee structure retrieved successfully", feeStructureService.getFeeStructure()));
    }

    @PostMapping("/academy-plans")
    public ResponseEntity<ApiResponse<AcademyFeePlanDto>> createAcademyFeePlan(@RequestBody AcademyFeePlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Academy fee plan created successfully", feeStructureService.createAcademyFeePlan(dto)));
    }

    @PutMapping("/academy-plans/{id}")
    public ResponseEntity<ApiResponse<AcademyFeePlanDto>> updateAcademyFeePlan(@PathVariable Long id, @RequestBody AcademyFeePlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Academy fee plan updated successfully", feeStructureService.updateAcademyFeePlan(id, dto)));
    }

    @PostMapping("/library-plans")
    public ResponseEntity<ApiResponse<LibraryFeePlanDto>> createLibraryFeePlan(@RequestBody LibraryFeePlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Library fee plan created successfully", feeStructureService.createLibraryFeePlan(dto)));
    }

    @PostMapping("/installment-plans")
    public ResponseEntity<ApiResponse<InstallmentPlanDto>> createInstallmentPlan(@RequestBody InstallmentPlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Installment plan created successfully", feeStructureService.createInstallmentPlan(dto)));
    }

    @PostMapping("/discount-rules")
    public ResponseEntity<ApiResponse<DiscountRuleDto>> createDiscountRule(@RequestBody DiscountRuleDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Discount rule created successfully", feeStructureService.createDiscountRule(dto)));
    }

    @DeleteMapping("/academy-plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAcademyFeePlan(@PathVariable Long id) {
        feeStructureService.deleteAcademyFeePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Academy fee plan deleted", null));
    }

    @DeleteMapping("/library-plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLibraryFeePlan(@PathVariable Long id) {
        feeStructureService.deleteLibraryFeePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Library fee plan deleted", null));
    }

    @DeleteMapping("/installment-plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInstallmentPlan(@PathVariable Long id) {
        feeStructureService.deleteInstallmentPlan(id);
        return ResponseEntity.ok(ApiResponse.success("Installment plan deleted", null));
    }

    @DeleteMapping("/discount-rules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDiscountRule(@PathVariable Long id) {
        feeStructureService.deleteDiscountRule(id);
        return ResponseEntity.ok(ApiResponse.success("Discount rule deleted", null));
    }
}
