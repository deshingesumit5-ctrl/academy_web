package com.AcademyWeb.service;

import com.AcademyWeb.dto.AttendanceDto;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    List<AttendanceDto> getAttendanceByDate(LocalDate date);
    AttendanceDto markAttendance(AttendanceDto dto);
    List<AttendanceDto> getAttendanceByStudentAndMonth(Long studentId, int year, int month);
}
