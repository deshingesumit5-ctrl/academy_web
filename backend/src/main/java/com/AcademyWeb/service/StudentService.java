package com.AcademyWeb.service;

import com.AcademyWeb.dto.StudentDto;
import java.util.List;

public interface StudentService {
    List<StudentDto> getAllStudents();
    StudentDto getStudentById(Long id);
    StudentDto registerStudent(StudentDto dto);
    StudentDto updateStudent(Long id, StudentDto dto);
    void deleteStudent(Long id);
}
