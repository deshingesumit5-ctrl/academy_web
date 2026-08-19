package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.LibraryPlanDto;
import com.AcademyWeb.entity.LibraryPlan;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.LibraryPlanRepository;
import com.AcademyWeb.service.LibraryPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibraryPlanServiceImpl implements LibraryPlanService {

    @Autowired
    private LibraryPlanRepository libraryPlanRepository;

    private LibraryPlanDto mapToDto(LibraryPlan entity) {
        return LibraryPlanDto.builder()
                .planId(entity.getPlanId())
                .planName(entity.getPlanName())
                .duration(entity.getDuration())
                .fees(entity.getFees())
                .description(entity.getDescription())
                .build();
    }

    private LibraryPlan mapToEntity(LibraryPlanDto dto) {
        return LibraryPlan.builder()
                .planId(dto.getPlanId())
                .planName(dto.getPlanName())
                .duration(dto.getDuration())
                .fees(dto.getFees())
                .description(dto.getDescription())
                .build();
    }

    @Override
    public List<LibraryPlanDto> getAllLibraryPlans() {
        return libraryPlanRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public LibraryPlanDto getLibraryPlanById(Long id) {
        LibraryPlan plan = libraryPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library Plan not found with ID: " + id));
        return mapToDto(plan);
    }

    @Override
    public LibraryPlanDto createLibraryPlan(LibraryPlanDto dto) {
        LibraryPlan plan = mapToEntity(dto);
        LibraryPlan saved = libraryPlanRepository.save(plan);
        return mapToDto(saved);
    }

    @Override
    public LibraryPlanDto updateLibraryPlan(Long id, LibraryPlanDto dto) {
        LibraryPlan existing = libraryPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Library Plan not found with ID: " + id));
        existing.setPlanName(dto.getPlanName());
        existing.setDuration(dto.getDuration());
        existing.setFees(dto.getFees());
        existing.setDescription(dto.getDescription());
        LibraryPlan updated = libraryPlanRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteLibraryPlan(Long id) {
        if (!libraryPlanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Library Plan not found with ID: " + id);
        }
        libraryPlanRepository.deleteById(id);
    }
}
