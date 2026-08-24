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

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
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
    @Transactional
    public MarksheetDto saveMarksheet(MarksheetDto dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Batch batch = dto.getBatchId() != null ? batchRepository.findById(dto.getBatchId()).orElse(null) : null;
        ExamMaster exam = dto.getExamId() != null ? examMasterRepository.findById(dto.getExamId()).orElse(null) : null;

        Marksheet marksheet;
        if (dto.getMarksheetId() != null) {
            marksheet = marksheetRepository.findById(dto.getMarksheetId())
                    .orElseGet(() -> new Marksheet());
            marksheet.setMarksheetId(dto.getMarksheetId());
        } else {
            marksheet = new Marksheet();
        }

        marksheet.setStudent(student);
        marksheet.setBatch(batch);
        marksheet.setAdmissionType(dto.getAdmissionType());
        marksheet.setExam(exam);
        if (dto.getFileUrl() != null) marksheet.setFileUrl(dto.getFileUrl());
        if (dto.getFileName() != null) marksheet.setFileName(dto.getFileName());

        Marksheet saved = marksheetRepository.save(marksheet);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public List<MarksheetDto> saveBulkMarksheets(List<MarksheetDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            throw new IllegalArgumentException("No marksheets provided for bulk upload");
        }

        List<Marksheet> marksheetsToSave = dtos.stream().map(dto -> {
            if (dto.getStudentId() == null) {
                throw new IllegalArgumentException("Student mapping is required for each marksheet");
            }
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + dto.getStudentId()));

            Batch batch = dto.getBatchId() != null ? batchRepository.findById(dto.getBatchId()).orElse(null) : student.getBatch();
            ExamMaster exam = dto.getExamId() != null ? examMasterRepository.findById(dto.getExamId()).orElse(null) : null;

            if (exam != null && marksheetRepository.existsByStudentStudentIdAndExamExamId(student.getStudentId(), exam.getExamId())) {
                throw new IllegalArgumentException("Marksheet already uploaded for student '" + student.getStudentName() + "' and exam '" + exam.getExamName() + "'");
            }

            Marksheet marksheet = new Marksheet();
            marksheet.setStudent(student);
            marksheet.setBatch(batch);
            marksheet.setAdmissionType(dto.getAdmissionType() != null ? dto.getAdmissionType() : student.getAdmissionType());
            marksheet.setExam(exam);
            marksheet.setFileUrl(dto.getFileUrl());
            marksheet.setFileName(dto.getFileName());
            return marksheet;
        }).collect(Collectors.toList());

        List<Marksheet> savedList = marksheetRepository.saveAll(marksheetsToSave);
        return savedList.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMarksheet(Long id) {
        if (!marksheetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Marksheet not found with ID: " + id);
        }
        marksheetRepository.deleteById(id);
    }
}
