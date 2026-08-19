package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Marksheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarksheetRepository extends JpaRepository<Marksheet, Long> {
    List<Marksheet> findByStudentStudentId(Long studentId);
}
