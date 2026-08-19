package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.DashboardStatsDto;
import com.AcademyWeb.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", dashboardService.getDashboardStats()));
    }
}
