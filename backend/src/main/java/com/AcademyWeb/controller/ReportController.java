package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportsSummary() {
        return ResponseEntity.ok(ApiResponse.success("Report metrics retrieved successfully", reportService.getReportsSummary()));
    }

    @GetMapping("/student-growth")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStudentGrowthReport() {
        return ResponseEntity.ok(ApiResponse.success("Student growth report retrieved successfully", reportService.getStudentGrowthReport()));
    }
}
