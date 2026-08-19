package com.AcademyWeb.repository;

import com.AcademyWeb.entity.ExamMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamMasterRepository extends JpaRepository<ExamMaster, Long> {
}
