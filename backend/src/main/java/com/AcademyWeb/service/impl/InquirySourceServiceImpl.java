package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.InquirySourceDto;
import com.AcademyWeb.entity.InquirySource;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.InquirySourceRepository;
import com.AcademyWeb.service.InquirySourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InquirySourceServiceImpl implements InquirySourceService {

    @Autowired
    private InquirySourceRepository inquirySourceRepository;

    private InquirySourceDto mapToDto(InquirySource entity) {
        return InquirySourceDto.builder()
                .sourceId(entity.getSourceId())
                .sourceName(entity.getSourceName())
                .build();
    }

    private InquirySource mapToEntity(InquirySourceDto dto) {
        return InquirySource.builder()
                .sourceId(dto.getSourceId())
                .sourceName(dto.getSourceName())
                .build();
    }

    @Override
    public List<InquirySourceDto> getAllInquirySources() {
        return inquirySourceRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public InquirySourceDto getInquirySourceById(Long id) {
        InquirySource source = inquirySourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry Source not found with ID: " + id));
        return mapToDto(source);
    }

    @Override
    @Transactional
    public InquirySourceDto createInquirySource(InquirySourceDto dto) {
        InquirySource source = mapToEntity(dto);
        InquirySource saved = inquirySourceRepository.save(source);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public InquirySourceDto updateInquirySource(Long id, InquirySourceDto dto) {
        InquirySource existing = inquirySourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry Source not found with ID: " + id));
        existing.setSourceName(dto.getSourceName());
        InquirySource updated = inquirySourceRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteInquirySource(Long id) {
        if (!inquirySourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inquiry Source not found with ID: " + id);
        }
        inquirySourceRepository.deleteById(id);
    }
}
