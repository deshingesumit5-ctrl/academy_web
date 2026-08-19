package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.MarksheetDto;
import com.AcademyWeb.entity.Batch;
import com.AcademyWeb.entity.ExamMaster;
import com.AcademyWeb.entity.Marksheet;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.BatchRepository;
import com.AcademyWeb.repository.ExamMasterRepository;
import com.AcademyWeb.repository.MarksheetRepository;
import com.AcademyWeb.repository.StudentRepository;
import com.AcademyWeb.service.MarksheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarksheetServiceImpl implements MarksheetService {

    @Autowired
    private MarksheetRepository marksheetRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private ExamMasterRepository examMasterRepository;

    private MarksheetDto mapToDto(Marksheet entity) {
        return MarksheetDto.builder()
                .marksheetId(entity.getMarksheetId())
                .studentId(entity.getStudent() != null ? entity.getStudent().getStudentId() : null)
                .studentName(entity.getStudent() != null ? entity.getStudent().getStudentName() : null)
                .admissionNumber(entity.getStudent() != null ? entity.getStudent().getAdmissionNumber() : null)
                .batchId(entity.getBatch() != null ? entity.getBatch().getBatchId() : null)
                .batchName(entity.getBatch() != null ? entity.getBatch().getBatchName() : null)
                .admissionType(entity.getAdmissionType())
                .examId(entity.getExam() != null ? entity.getExam().getExamId() : null)
                .examName(entity.getExam() != null ? entity.getExam().getExamName() : null)
                .fileUrl(entity.getFileUrl())
                .fileName(entity.getFileName())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Override
    public List<MarksheetDto> getAllMarksheets() {
        return marksheetRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public MarksheetDto saveMarksheet(MarksheetDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Batch batch = dto.getBatchId() != null ? batchRepository.findById(dto.getBatchId()).orElse(null) : null;
        ExamMaster exam = dto.getExamId() != null ? examMasterRepository.findById(dto.getExamId()).orElse(null) : null;

        Marksheet marksheet = Marksheet.builder()
                .student(student)
                .batch(batch)
                .admissionType(dto.getAdmissionType())
                .exam(exam)
                .fileUrl(dto.getFileUrl())
                .fileName(dto.getFileName())
                .build();

        Marksheet saved = marksheetRepository.save(marksheet);
        return mapToDto(saved);
    }

    @Override
    public void deleteMarksheet(Long id) {
        if (!marksheetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Marksheet not found with ID: " + id);
        }
        marksheetRepository.deleteById(id);
    }
}
