package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.FeePaymentDto;
import com.AcademyWeb.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeController {

    @Autowired
    private FeeService feeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeePaymentDto>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", feeService.getAllPayments()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeePaymentDto>> recordPayment(@RequestBody FeePaymentDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Fee payment recorded successfully", feeService.recordPayment(dto)));
    }
}
