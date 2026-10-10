package com.AcademyWeb.repository;

import com.AcademyWeb.entity.CategoryMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryMaster, Long> {
    List<CategoryMaster> findByStatus(String status);
    Optional<CategoryMaster> findByCategoryCode(String categoryCode);
}
