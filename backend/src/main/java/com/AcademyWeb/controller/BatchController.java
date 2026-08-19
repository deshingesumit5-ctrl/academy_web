package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.BatchDto;
import com.AcademyWeb.service.BatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    @Autowired
    private BatchService batchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BatchDto>>> getAllBatches() {
        return ResponseEntity.ok(ApiResponse.success("Batches retrieved successfully", batchService.getAllBatches()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchDto>> getBatchById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Batch retrieved successfully", batchService.getBatchById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BatchDto>> createBatch(@Valid @RequestBody BatchDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Batch created successfully", batchService.createBatch(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BatchDto>> updateBatch(@PathVariable Long id, @Valid @RequestBody BatchDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Batch updated successfully", batchService.updateBatch(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(@PathVariable Long id) {
        batchService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Batch deleted successfully", null));
    }
}
