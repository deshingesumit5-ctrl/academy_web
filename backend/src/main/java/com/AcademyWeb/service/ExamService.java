package com.AcademyWeb.service;

import com.AcademyWeb.dto.ExamDto;
import java.util.List;

public interface ExamService {
    List<ExamDto> getAllExams();
    ExamDto getExamById(Long id);
    ExamDto createExam(ExamDto dto);
    ExamDto updateExam(Long id, ExamDto dto);
    void deleteExam(Long id);
}
