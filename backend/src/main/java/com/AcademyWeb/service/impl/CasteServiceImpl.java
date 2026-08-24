package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.Caste;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.CasteRepository;
import com.AcademyWeb.service.CasteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CasteServiceImpl implements CasteService {

    @Autowired
    private CasteRepository casteRepository;

    @Override
    public List<Caste> getAllCastes() {
        return casteRepository.findAll();
    }

    @Override
    public List<Caste> getActiveCastes() {
        return casteRepository.findByStatus("Active");
    }

    @Override
    public Caste getCasteById(Long id) {
        return casteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Caste not found with ID: " + id));
    }

    @Override
    @Transactional
    public Caste saveCaste(Caste caste) {
        return casteRepository.save(caste);
    }

    @Override
    @Transactional
    public void deleteCaste(Long id) {
        if (!casteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Caste not found with ID: " + id);
        }
        casteRepository.deleteById(id);
    }
}
