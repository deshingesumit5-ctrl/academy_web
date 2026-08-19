package com.AcademyWeb.repository;

import com.AcademyWeb.entity.InstallmentPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstallmentPlanRepository extends JpaRepository<InstallmentPlan, Long> {
}
