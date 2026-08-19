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

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
