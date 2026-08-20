package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.BloodGroupDto;
import com.AcademyWeb.service.BloodGroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blood-groups")
public class BloodGroupController {

    @Autowired
    private BloodGroupService bloodGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BloodGroupDto>>> getAllBloodGroups() {
        return ResponseEntity.ok(ApiResponse.success("Blood groups retrieved successfully", bloodGroupService.getAllBloodGroups()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodGroupDto>> getBloodGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Blood group retrieved successfully", bloodGroupService.getBloodGroupById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BloodGroupDto>> createBloodGroup(@Valid @RequestBody BloodGroupDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Blood group created successfully", bloodGroupService.createBloodGroup(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodGroupDto>> updateBloodGroup(@PathVariable Long id, @Valid @RequestBody BloodGroupDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Blood group updated successfully", bloodGroupService.updateBloodGroup(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBloodGroup(@PathVariable Long id) {
        bloodGroupService.deleteBloodGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Blood group deleted successfully", null));
    }
}
