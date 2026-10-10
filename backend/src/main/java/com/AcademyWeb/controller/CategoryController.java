package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.entity.CategoryMaster;
import com.AcademyWeb.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryMaster>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categoryService.getAllCategories()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<CategoryMaster>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success("Active categories retrieved successfully", categoryService.getActiveCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryMaster>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", categoryService.getCategoryById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryMaster>> saveCategory(@RequestBody CategoryMaster category) {
        return ResponseEntity.ok(ApiResponse.success("Category saved successfully", categoryService.saveCategory(category)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryMaster>> updateCategory(@PathVariable Long id, @RequestBody CategoryMaster category) {
        category.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", categoryService.saveCategory(category)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
