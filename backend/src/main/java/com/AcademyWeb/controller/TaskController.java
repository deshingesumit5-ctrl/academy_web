package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.TaskDto;
import com.AcademyWeb.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDto>>> getAllTasks() {
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved successfully", taskService.getAllTasks()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto>> createTask(@Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Task created successfully", taskService.createTask(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", taskService.updateTask(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
