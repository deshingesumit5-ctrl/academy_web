package com.AcademyWeb.service;

import com.AcademyWeb.entity.Religion;

import java.util.List;

public interface ReligionService {
    List<Religion> getAllReligions();
    List<Religion> getActiveReligions();
    Religion saveReligion(Religion religion);
    void deleteReligion(Long id);
}
