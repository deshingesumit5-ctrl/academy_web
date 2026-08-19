package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.ExamDto;
import com.AcademyWeb.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    @Autowired
    private ExamService examService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExamDto>>> getAllExams() {
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved successfully", examService.getAllExams()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDto>> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved successfully", examService.getExamById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExamDto>> createExam(@Valid @RequestBody ExamDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", examService.createExam(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExamDto>> updateExam(@PathVariable Long id, @Valid @RequestBody ExamDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", examService.updateExam(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", null));
    }
}
