package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.entity.District;
import com.AcademyWeb.service.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/districts")
public class DistrictController {

    @Autowired
    private DistrictService districtService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<District>>> getAllDistricts() {
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved successfully", districtService.getAllDistricts()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<District>>> getActiveDistricts() {
        return ResponseEntity.ok(ApiResponse.success("Active districts retrieved successfully", districtService.getActiveDistricts()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<District>> saveDistrict(@RequestBody District district) {
        return ResponseEntity.ok(ApiResponse.success("District saved successfully", districtService.saveDistrict(district)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<District>> updateDistrict(@PathVariable Long id, @RequestBody District district) {
        district.setDistrictId(id);
        return ResponseEntity.ok(ApiResponse.success("District updated successfully", districtService.saveDistrict(district)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDistrict(@PathVariable Long id) {
        districtService.deleteDistrict(id);
        return ResponseEntity.ok(ApiResponse.success("District deleted successfully", null));
    }
}
