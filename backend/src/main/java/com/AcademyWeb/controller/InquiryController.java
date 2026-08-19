package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.InquiryDto;
import com.AcademyWeb.service.InquiryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    private InquiryService inquiryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<InquiryDto>>> getAllInquiries() {
        return ResponseEntity.ok(ApiResponse.success("Inquiries retrieved successfully", inquiryService.getAllInquiries()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InquiryDto>> createInquiry(@Valid @RequestBody InquiryDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry created successfully", inquiryService.createInquiry(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InquiryDto>> updateInquiry(@PathVariable Long id, @Valid @RequestBody InquiryDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry updated successfully", inquiryService.updateInquiry(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok(ApiResponse.success("Inquiry deleted successfully", null));
    }
}
