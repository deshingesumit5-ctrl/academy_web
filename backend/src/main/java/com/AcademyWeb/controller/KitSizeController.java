package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.entity.KitSize;
import com.AcademyWeb.service.KitSizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kit-sizes")
public class KitSizeController {

    @Autowired
    private KitSizeService kitSizeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<KitSize>>> getAllKitSizes() {
        return ResponseEntity.ok(ApiResponse.success("Kit sizes retrieved successfully", kitSizeService.getAllKitSizes()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<KitSize>>> getActiveKitSizes() {
        return ResponseEntity.ok(ApiResponse.success("Active kit sizes retrieved successfully", kitSizeService.getActiveKitSizes()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<KitSize>> saveKitSize(@RequestBody KitSize kitSize) {
        return ResponseEntity.ok(ApiResponse.success("Kit size saved successfully", kitSizeService.saveKitSize(kitSize)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<KitSize>> updateKitSize(@PathVariable Long id, @RequestBody KitSize kitSize) {
        kitSize.setKitSizeId(id);
        return ResponseEntity.ok(ApiResponse.success("Kit size updated successfully", kitSizeService.saveKitSize(kitSize)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteKitSize(@PathVariable Long id) {
        kitSizeService.deleteKitSize(id);
        return ResponseEntity.ok(ApiResponse.success("Kit size deleted successfully", null));
    }
}
