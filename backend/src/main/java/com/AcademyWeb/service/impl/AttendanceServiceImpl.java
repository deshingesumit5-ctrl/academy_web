package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.AttendanceDto;
import com.AcademyWeb.entity.Attendance;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.AttendanceRepository;
import com.AcademyWeb.repository.StudentRepository;
import com.AcademyWeb.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    private AttendanceDto mapToDto(Attendance entity) {
        return AttendanceDto.builder()
                .attendanceId(entity.getAttendanceId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getStudentId() : null)
                .admissionNumber(entity.getStudent() != null ? entity.getStudent().getAdmissionNumber() : null)
                .studentName(entity.getStudent() != null ? entity.getStudent().getStudentName() : null)
                .batchName(entity.getStudent() != null && entity.getStudent().getBatch() != null ? entity.getStudent().getBatch().getBatchName() : null)
                .attendanceDate(entity.getAttendanceDate())
                .timeIn(entity.getTimeIn())
                .timeOut(entity.getTimeOut())
                .status(entity.getStatus())
                .deviceMode(entity.getDeviceMode())
                .build();
    }

    @Override
    public List<AttendanceDto> getAttendanceByDate(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return attendanceRepository.findByAttendanceDate(date).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceDto markAttendance(AttendanceDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Attendance attendance = Attendance.builder()
                .student(student)
                .attendanceDate(dto.getAttendanceDate() != null ? dto.getAttendanceDate() : LocalDate.now())
                .timeIn(dto.getTimeIn())
                .timeOut(dto.getTimeOut())
                .status(dto.getStatus() != null ? dto.getStatus() : "PRESENT")
                .deviceMode(dto.getDeviceMode() != null ? dto.getDeviceMode() : "MANUAL")
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }
}
