package com.AcademyWeb.service;

import com.AcademyWeb.dto.AcademyDto;
import java.util.List;

public interface AcademyService {
    List<AcademyDto> getAllAcademies();
    AcademyDto getAcademyById(Long id);
    AcademyDto createAcademy(AcademyDto dto);
    AcademyDto updateAcademy(Long id, AcademyDto dto);
    void deleteAcademy(Long id);
}
