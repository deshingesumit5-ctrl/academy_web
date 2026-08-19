package com.AcademyWeb.controller;

import com.AcademyWeb.dto.AcademyDto;
import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.service.AcademyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academies")
public class AcademyController {

    @Autowired
    private AcademyService academyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademyDto>>> getAllAcademies() {
        return ResponseEntity.ok(ApiResponse.success("Academies retrieved successfully", academyService.getAllAcademies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademyDto>> getAcademyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Academy retrieved successfully", academyService.getAcademyById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademyDto>> createAcademy(@Valid @RequestBody AcademyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Academy created successfully", academyService.createAcademy(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademyDto>> updateAcademy(@PathVariable Long id, @Valid @RequestBody AcademyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Academy updated successfully", academyService.updateAcademy(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAcademy(@PathVariable Long id) {
        academyService.deleteAcademy(id);
        return ResponseEntity.ok(ApiResponse.success("Academy deleted successfully", null));
    }
}
