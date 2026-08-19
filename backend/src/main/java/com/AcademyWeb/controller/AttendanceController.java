package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.AttendanceDto;
import com.AcademyWeb.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAttendanceByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Attendance logs retrieved successfully", attendanceService.getAttendanceByDate(date)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceDto>> markAttendance(@RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", attendanceService.markAttendance(dto)));
    }
}
