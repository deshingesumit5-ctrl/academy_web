package com.AcademyWeb.service;

import com.AcademyWeb.entity.CategoryMaster;

import java.util.List;

public interface CategoryService {
    List<CategoryMaster> getAllCategories();
    List<CategoryMaster> getActiveCategories();
    CategoryMaster getCategoryById(Long id);
    CategoryMaster saveCategory(CategoryMaster category);
    void deleteCategory(Long id);
}
