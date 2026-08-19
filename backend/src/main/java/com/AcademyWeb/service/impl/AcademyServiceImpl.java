package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.AcademyDto;
import com.AcademyWeb.entity.Academy;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.AcademyRepository;
import com.AcademyWeb.service.AcademyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AcademyServiceImpl implements AcademyService {

    @Autowired
    private AcademyRepository academyRepository;

    private AcademyDto mapToDto(Academy entity) {
        return AcademyDto.builder()
                .academyId(entity.getAcademyId())
                .academyName(entity.getAcademyName())
                .branchName(entity.getBranchName())
                .address(entity.getAddress())
                .contactNumber(entity.getContactNumber())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private Academy mapToEntity(AcademyDto dto) {
        return Academy.builder()
                .academyId(dto.getAcademyId())
                .academyName(dto.getAcademyName())
                .branchName(dto.getBranchName())
                .address(dto.getAddress())
                .contactNumber(dto.getContactNumber())
                .build();
    }

    @Override
    public List<AcademyDto> getAllAcademies() {
        return academyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AcademyDto getAcademyById(Long id) {
        Academy academy = academyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academy not found with ID: " + id));
        return mapToDto(academy);
    }

    @Override
    public AcademyDto createAcademy(AcademyDto dto) {
        Academy academy = mapToEntity(dto);
        Academy saved = academyRepository.save(academy);
        return mapToDto(saved);
    }

    @Override
    public AcademyDto updateAcademy(Long id, AcademyDto dto) {
        Academy existing = academyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academy not found with ID: " + id));
        existing.setAcademyName(dto.getAcademyName());
        existing.setBranchName(dto.getBranchName());
        existing.setAddress(dto.getAddress());
        existing.setContactNumber(dto.getContactNumber());
        Academy updated = academyRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteAcademy(Long id) {
        if (!academyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Academy not found with ID: " + id);
        }
        academyRepository.deleteById(id);
    }
}
