package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.StudentDto;
import com.AcademyWeb.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentDto>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", studentService.getAllStudents()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", studentService.getStudentById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentDto>> registerStudent(@Valid @RequestBody StudentDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Student registered successfully", studentService.registerStudent(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", studentService.updateStudent(id, dto)));
    }

    @PutMapping("/{id}/roll-number")
    public ResponseEntity<ApiResponse<StudentDto>> reassignRollNumber(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String newRoll = payload.get("rollNumber");
        return ResponseEntity.ok(ApiResponse.success("Roll number reassigned successfully", studentService.reassignRollNumber(id, newRoll)));
    }

    @PutMapping("/{id}/discount")
    public ResponseEntity<ApiResponse<StudentDto>> assignDiscount(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        java.math.BigDecimal discount = payload.get("discountAmount") != null ? new java.math.BigDecimal(payload.get("discountAmount").toString()) : java.math.BigDecimal.ZERO;
        java.math.BigDecimal concession = payload.get("concessionAmount") != null ? new java.math.BigDecimal(payload.get("concessionAmount").toString()) : java.math.BigDecimal.ZERO;
        String remarks = payload.get("remarks") != null ? payload.get("remarks").toString() : null;
        return ResponseEntity.ok(ApiResponse.success("Discount/Concession updated successfully", studentService.assignDiscountAndConcession(id, discount, concession, remarks)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
