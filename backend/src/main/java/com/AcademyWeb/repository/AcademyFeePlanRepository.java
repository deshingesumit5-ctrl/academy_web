package com.AcademyWeb.repository;

import com.AcademyWeb.entity.AcademyFeePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademyFeePlanRepository extends JpaRepository<AcademyFeePlan, Long> {
}
