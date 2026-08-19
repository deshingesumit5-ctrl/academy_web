package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByAttendanceDate(LocalDate date);
    long countByAttendanceDateAndStatus(LocalDate date, String status);
}
