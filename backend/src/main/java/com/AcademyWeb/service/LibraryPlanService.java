package com.AcademyWeb.service;

import com.AcademyWeb.dto.LibraryPlanDto;
import java.util.List;

public interface LibraryPlanService {
    List<LibraryPlanDto> getAllLibraryPlans();
    LibraryPlanDto getLibraryPlanById(Long id);
    LibraryPlanDto createLibraryPlan(LibraryPlanDto dto);
    LibraryPlanDto updateLibraryPlan(Long id, LibraryPlanDto dto);
    void deleteLibraryPlan(Long id);
}
