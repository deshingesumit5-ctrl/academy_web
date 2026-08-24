package com.AcademyWeb.service;

import com.AcademyWeb.entity.Caste;
import java.util.List;

public interface CasteService {
    List<Caste> getAllCastes();
    List<Caste> getActiveCastes();
    Caste getCasteById(Long id);
    Caste saveCaste(Caste caste);
    void deleteCaste(Long id);
}
