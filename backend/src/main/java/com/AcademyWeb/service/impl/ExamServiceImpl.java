package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.ExamDto;
import com.AcademyWeb.entity.ExamMaster;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.ExamMasterRepository;
import com.AcademyWeb.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ExamServiceImpl implements ExamService {

    @Autowired
    private ExamMasterRepository examMasterRepository;

    private ExamDto mapToDto(ExamMaster entity) {
        return ExamDto.builder()
                .examId(entity.getExamId())
                .examName(entity.getExamName())
                .examType(entity.getExamType())
                .build();
    }

    private ExamMaster mapToEntity(ExamDto dto) {
        return ExamMaster.builder()
                .examId(dto.getExamId())
                .examName(dto.getExamName())
                .examType(dto.getExamType())
                .build();
    }

    @Override
    public List<ExamDto> getAllExams() {
        return examMasterRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ExamDto getExamById(Long id) {
        ExamMaster exam = examMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + id));
        return mapToDto(exam);
    }

    @Override
    @Transactional
    public ExamDto createExam(ExamDto dto) {
        ExamMaster exam = mapToEntity(dto);
        ExamMaster saved = examMasterRepository.save(exam);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ExamDto updateExam(Long id, ExamDto dto) {
        ExamMaster existing = examMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with ID: " + id));
        existing.setExamName(dto.getExamName());
        existing.setExamType(dto.getExamType());
        ExamMaster updated = examMasterRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteExam(Long id) {
        if (!examMasterRepository.existsById(id)) {
            throw new ResourceNotFoundException("Exam not found with ID: " + id);
        }
        examMasterRepository.deleteById(id);
    }
}
