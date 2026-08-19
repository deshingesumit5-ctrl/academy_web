package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.CourseDto;
import com.AcademyWeb.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.success("Courses retrieved successfully", courseService.getAllCourses()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Course retrieved successfully", courseService.getCourseById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Course created successfully", courseService.createCourse(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Course updated successfully", courseService.updateCourse(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted successfully", null));
    }
}
