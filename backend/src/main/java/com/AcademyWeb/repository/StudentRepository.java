package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);

    List<Student> findAllByOrderByStudentIdDesc();

    long countByStatus(String status);

    long countByAdmissionDate(LocalDate admissionDate);

    long countByAdmissionDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT s.studentId, COALESCE(c.fees, 0) + COALESCE(lp.fees, 0) " +
            "FROM Student s LEFT JOIN s.course c LEFT JOIN s.libraryPlan lp " +
            "WHERE s.status = 'ACTIVE'")
    List<Object[]> findActiveStudentTotalFees();
}
