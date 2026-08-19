package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.LibraryPlanDto;
import com.AcademyWeb.service.LibraryPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library-plans")
public class LibraryPlanController {

    @Autowired
    private LibraryPlanService libraryPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LibraryPlanDto>>> getAllLibraryPlans() {
        return ResponseEntity.ok(ApiResponse.success("Library plans retrieved successfully", libraryPlanService.getAllLibraryPlans()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LibraryPlanDto>> getLibraryPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Library plan retrieved successfully", libraryPlanService.getLibraryPlanById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LibraryPlanDto>> createLibraryPlan(@Valid @RequestBody LibraryPlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Library plan created successfully", libraryPlanService.createLibraryPlan(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LibraryPlanDto>> updateLibraryPlan(@PathVariable Long id, @Valid @RequestBody LibraryPlanDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Library plan updated successfully", libraryPlanService.updateLibraryPlan(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLibraryPlan(@PathVariable Long id) {
        libraryPlanService.deleteLibraryPlan(id);
        return ResponseEntity.ok(ApiResponse.success("Library plan deleted successfully", null));
    }
}
