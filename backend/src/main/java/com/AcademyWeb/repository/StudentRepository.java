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

    @Query("SELECT s.studentId, " +
           "CASE " +
           "  WHEN (UPPER(s.admissionType) LIKE '%ACADEMY_LIBRARY%' OR UPPER(s.admissionType) LIKE '%ACADEMY + LIBRARY%' OR UPPER(s.admissionType) LIKE '%ACADEMY+LIBRARY%' OR UPPER(s.admissionType) LIKE '%ACADEMY & LIBRARY%') THEN COALESCE(c.fees, 0) + COALESCE(lp.fees, 0) " +
           "  WHEN (UPPER(s.admissionType) LIKE '%LIBRARY%') THEN COALESCE(lp.fees, 0) " +
           "  WHEN (UPPER(s.admissionType) LIKE '%ACADEMY%') THEN COALESCE(c.fees, 0) " +
           "  ELSE COALESCE(c.fees, 0) + COALESCE(lp.fees, 0) " +
           "END " +
           "FROM Student s LEFT JOIN s.course c LEFT JOIN s.libraryPlan lp " +
           "WHERE s.status = 'ACTIVE'")
    List<Object[]> findActiveStudentTotalFees();
}
