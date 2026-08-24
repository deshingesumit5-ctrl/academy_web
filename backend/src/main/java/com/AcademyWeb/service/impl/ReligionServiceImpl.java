package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.Religion;
import com.AcademyWeb.repository.ReligionRepository;
import com.AcademyWeb.service.ReligionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReligionServiceImpl implements ReligionService {

    @Autowired
    private ReligionRepository religionRepository;

    @Override
    public List<Religion> getAllReligions() {
        return religionRepository.findAll();
    }

    @Override
    public List<Religion> getActiveReligions() {
        return religionRepository.findByStatus("Active");
    }

    @Override
    public Religion saveReligion(Religion religion) {
        return religionRepository.save(religion);
    }

    @Override
    public void deleteReligion(Long id) {
        religionRepository.deleteById(id);
    }
}
