package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.BatchDto;
import com.AcademyWeb.entity.Batch;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.BatchRepository;
import com.AcademyWeb.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BatchServiceImpl implements BatchService {

    @Autowired
    private BatchRepository batchRepository;

    private BatchDto mapToDto(Batch entity) {
        return BatchDto.builder()
                .batchId(entity.getBatchId())
                .batchName(entity.getBatchName())
                .faculty(entity.getFaculty())
                .batchTiming(entity.getBatchTiming())
                .capacity(entity.getCapacity())
                .build();
    }

    private Batch mapToEntity(BatchDto dto) {
        return Batch.builder()
                .batchId(dto.getBatchId())
                .batchName(dto.getBatchName())
                .faculty(dto.getFaculty())
                .batchTiming(dto.getBatchTiming())
                .capacity(dto.getCapacity())
                .build();
    }

    @Override
    public List<BatchDto> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public BatchDto getBatchById(Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + id));
        return mapToDto(batch);
    }

    @Override
    public BatchDto createBatch(BatchDto dto) {
        Batch batch = mapToEntity(dto);
        Batch saved = batchRepository.save(batch);
        return mapToDto(saved);
    }

    @Override
    public BatchDto updateBatch(Long id, BatchDto dto) {
        Batch existing = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with ID: " + id));
        existing.setBatchName(dto.getBatchName());
        existing.setFaculty(dto.getFaculty());
        existing.setBatchTiming(dto.getBatchTiming());
        existing.setCapacity(dto.getCapacity());
        Batch updated = batchRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteBatch(Long id) {
        if (!batchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Batch not found with ID: " + id);
        }
        batchRepository.deleteById(id);
    }
}
