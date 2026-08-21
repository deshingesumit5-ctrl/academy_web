package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.InquiryDto;
import com.AcademyWeb.entity.Inquiry;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.InquiryRepository;
import com.AcademyWeb.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InquiryServiceImpl implements InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    private InquiryDto mapToDto(Inquiry entity) {
        return InquiryDto.builder()
                .inquiryId(entity.getInquiryId())
                .studentName(entity.getStudentName())
                .parentName(entity.getParentName())
                .mobileNumber(entity.getMobileNumber())
                .interestedCourse(entity.getInterestedCourse())
                .admissionType(entity.getAdmissionType())
                .inquirySource(entity.getInquirySource())
                .counselorAssigned(entity.getCounselorAssigned())
                .remarks(entity.getRemarks())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private Inquiry mapToEntity(InquiryDto dto) {
        return Inquiry.builder()
                .inquiryId(dto.getInquiryId())
                .studentName(dto.getStudentName())
                .parentName(dto.getParentName())
                .mobileNumber(dto.getMobileNumber())
                .interestedCourse(dto.getInterestedCourse())
                .admissionType(dto.getAdmissionType())
                .inquirySource(dto.getInquirySource())
                .counselorAssigned(dto.getCounselorAssigned())
                .remarks(dto.getRemarks())
                .status(dto.getStatus() != null ? dto.getStatus() : "Open")
                .build();
    }

    @Override
    public List<InquiryDto> getAllInquiries() {
        return inquiryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InquiryDto createInquiry(InquiryDto dto) {
        Inquiry inquiry = mapToEntity(dto);
        Inquiry saved = inquiryRepository.save(inquiry);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public InquiryDto updateInquiry(Long id, InquiryDto dto) {
        Inquiry existing = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with ID: " + id));

        existing.setStudentName(dto.getStudentName());
        existing.setParentName(dto.getParentName());
        existing.setMobileNumber(dto.getMobileNumber());
        existing.setInterestedCourse(dto.getInterestedCourse());
        existing.setAdmissionType(dto.getAdmissionType());
        existing.setInquirySource(dto.getInquirySource());
        existing.setCounselorAssigned(dto.getCounselorAssigned());
        existing.setRemarks(dto.getRemarks());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        Inquiry updated = inquiryRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteInquiry(Long id) {
        if (!inquiryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inquiry not found with ID: " + id);
        }
        inquiryRepository.deleteById(id);
    }
}
