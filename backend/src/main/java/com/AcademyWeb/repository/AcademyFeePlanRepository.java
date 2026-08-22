package com.AcademyWeb.repository;

import com.AcademyWeb.entity.AcademyFeePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AcademyFeePlanRepository extends JpaRepository<AcademyFeePlan, Long> {
    Optional<AcademyFeePlan> findByCourseCourseId(Long courseId);
    Optional<AcademyFeePlan> findByPlanNameIgnoreCase(String planName);
}
