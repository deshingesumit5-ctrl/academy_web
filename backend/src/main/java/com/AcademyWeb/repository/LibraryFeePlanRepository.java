package com.AcademyWeb.repository;

import com.AcademyWeb.entity.LibraryFeePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LibraryFeePlanRepository extends JpaRepository<LibraryFeePlan, Long> {
}
