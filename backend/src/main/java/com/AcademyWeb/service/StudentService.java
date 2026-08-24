package com.AcademyWeb.service;

import com.AcademyWeb.dto.StudentDto;
import java.util.List;

public interface StudentService {
    List<StudentDto> getAllStudents();
    StudentDto getStudentById(Long id);
    StudentDto registerStudent(StudentDto dto);
    StudentDto updateStudent(Long id, StudentDto dto);
    StudentDto reassignRollNumber(Long id, String newRollNumber);
    StudentDto assignDiscountAndConcession(Long id, java.math.BigDecimal discountAmount, java.math.BigDecimal concessionAmount, String remarks);
    void deleteStudent(Long id);
}
