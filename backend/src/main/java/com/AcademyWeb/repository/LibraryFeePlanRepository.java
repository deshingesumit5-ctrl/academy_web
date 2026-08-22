package com.AcademyWeb.repository;

import com.AcademyWeb.entity.LibraryFeePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LibraryFeePlanRepository extends JpaRepository<LibraryFeePlan, Long> {
    Optional<LibraryFeePlan> findByLibraryPlanPlanId(Long planId);
    Optional<LibraryFeePlan> findByPlanNameIgnoreCase(String planName);
}
