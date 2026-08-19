package com.AcademyWeb.service;

import com.AcademyWeb.dto.BatchDto;
import java.util.List;

public interface BatchService {
    List<BatchDto> getAllBatches();
    BatchDto getBatchById(Long id);
    BatchDto createBatch(BatchDto dto);
    BatchDto updateBatch(Long id, BatchDto dto);
    void deleteBatch(Long id);
}
