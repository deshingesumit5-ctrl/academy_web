package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.CategoryMaster;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.CategoryRepository;
import com.AcademyWeb.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<CategoryMaster> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public List<CategoryMaster> getActiveCategories() {
        return categoryRepository.findByStatus("Active");
    }

    @Override
    public CategoryMaster getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Override
    public CategoryMaster saveCategory(CategoryMaster category) {
        return categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
