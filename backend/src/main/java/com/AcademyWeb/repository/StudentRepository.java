package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    long countByStatus(String status);
    long countByAdmissionDate(LocalDate admissionDate);
    long countByAdmissionDateBetween(LocalDate start, LocalDate end);
}
