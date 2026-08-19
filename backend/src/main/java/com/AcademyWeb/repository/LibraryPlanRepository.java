package com.AcademyWeb.repository;

import com.AcademyWeb.entity.LibraryPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryPlanRepository extends JpaRepository<LibraryPlan, Long> {
}
