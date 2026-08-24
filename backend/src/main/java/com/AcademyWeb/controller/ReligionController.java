package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.entity.Religion;
import com.AcademyWeb.service.ReligionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/religions")
public class ReligionController {

    @Autowired
    private ReligionService religionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Religion>>> getAllReligions() {
        return ResponseEntity.ok(ApiResponse.success("Religions retrieved successfully", religionService.getAllReligions()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Religion>>> getActiveReligions() {
        return ResponseEntity.ok(ApiResponse.success("Active religions retrieved successfully", religionService.getActiveReligions()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Religion>> saveReligion(@RequestBody Religion religion) {
        return ResponseEntity.ok(ApiResponse.success("Religion saved successfully", religionService.saveReligion(religion)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Religion>> updateReligion(@PathVariable Long id, @RequestBody Religion religion) {
        religion.setReligionId(id);
        return ResponseEntity.ok(ApiResponse.success("Religion updated successfully", religionService.saveReligion(religion)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReligion(@PathVariable Long id) {
        religionService.deleteReligion(id);
        return ResponseEntity.ok(ApiResponse.success("Religion deleted successfully", null));
    }
}
