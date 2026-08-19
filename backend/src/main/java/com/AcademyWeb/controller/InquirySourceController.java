package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.InquirySourceDto;
import com.AcademyWeb.service.InquirySourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiry-sources")
public class InquirySourceController {

    @Autowired
    private InquirySourceService inquirySourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InquirySourceDto>>> getAllInquirySources() {
        return ResponseEntity.ok(ApiResponse.success("Inquiry sources retrieved successfully", inquirySourceService.getAllInquirySources()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InquirySourceDto>> getInquirySourceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry source retrieved successfully", inquirySourceService.getInquirySourceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InquirySourceDto>> createInquirySource(@Valid @RequestBody InquirySourceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry source created successfully", inquirySourceService.createInquirySource(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InquirySourceDto>> updateInquirySource(@PathVariable Long id, @Valid @RequestBody InquirySourceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry source updated successfully", inquirySourceService.updateInquirySource(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInquirySource(@PathVariable Long id) {
        inquirySourceService.deleteInquirySource(id);
        return ResponseEntity.ok(ApiResponse.success("Inquiry source deleted successfully", null));
    }
}
