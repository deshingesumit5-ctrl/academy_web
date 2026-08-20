package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.BloodGroupDto;
import com.AcademyWeb.entity.BloodGroup;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.BloodGroupRepository;
import com.AcademyWeb.service.BloodGroupService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BloodGroupServiceImpl implements BloodGroupService {

    @Autowired
    private BloodGroupRepository bloodGroupRepository;

    @PostConstruct
    public void seedDefaults() {
        if (bloodGroupRepository.count() == 0) {
            List<String> defaults = Arrays.asList("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-");
            for (String bg : defaults) {
                bloodGroupRepository.save(BloodGroup.builder().name(bg).status("Active").build());
            }
        }
    }

    @Override
    public List<BloodGroupDto> getAllBloodGroups() {
        if (bloodGroupRepository.count() == 0) {
            seedDefaults();
        }
        return bloodGroupRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BloodGroupDto getBloodGroupById(Long id) {
        BloodGroup entity = bloodGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood Group not found with id: " + id));
        return mapToDto(entity);
    }

    @Override
    public BloodGroupDto createBloodGroup(BloodGroupDto dto) {
        BloodGroup entity = BloodGroup.builder()
                .name(dto.getName())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .build();
        BloodGroup saved = bloodGroupRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public BloodGroupDto updateBloodGroup(Long id, BloodGroupDto dto) {
        BloodGroup entity = bloodGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood Group not found with id: " + id));
        entity.setName(dto.getName());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        BloodGroup saved = bloodGroupRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public void deleteBloodGroup(Long id) {
        BloodGroup entity = bloodGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood Group not found with id: " + id));
        bloodGroupRepository.delete(entity);
    }

    private BloodGroupDto mapToDto(BloodGroup entity) {
        return BloodGroupDto.builder()
                .bloodGroupId(entity.getBloodGroupId())
                .name(entity.getName())
                .status(entity.getStatus())
                .build();
    }
}
