package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.entity.Caste;
import com.AcademyWeb.service.CasteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/castes")
public class CasteController {

    @Autowired
    private CasteService casteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Caste>>> getAllCastes() {
        return ResponseEntity.ok(ApiResponse.success("Castes retrieved successfully", casteService.getAllCastes()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Caste>>> getActiveCastes() {
        return ResponseEntity.ok(ApiResponse.success("Active castes retrieved successfully", casteService.getActiveCastes()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Caste>> saveCaste(@RequestBody Caste caste) {
        return ResponseEntity.ok(ApiResponse.success("Caste saved successfully", casteService.saveCaste(caste)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Caste>> updateCaste(@PathVariable Long id, @RequestBody Caste caste) {
        caste.setCasteId(id);
        return ResponseEntity.ok(ApiResponse.success("Caste updated successfully", casteService.saveCaste(caste)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCaste(@PathVariable Long id) {
        casteService.deleteCaste(id);
        return ResponseEntity.ok(ApiResponse.success("Caste deleted successfully", null));
    }
}
