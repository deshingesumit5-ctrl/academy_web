package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.KitSize;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.KitSizeRepository;
import com.AcademyWeb.service.KitSizeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class KitSizeServiceImpl implements KitSizeService {

    @Autowired
    private KitSizeRepository kitSizeRepository;

    @Override
    public List<KitSize> getAllKitSizes() {
        return kitSizeRepository.findAll();
    }

    @Override
    public List<KitSize> getActiveKitSizes() {
        return kitSizeRepository.findByStatus("Active");
    }

    @Override
    public KitSize getKitSizeById(Long id) {
        return kitSizeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kit size not found with ID: " + id));
    }

    @Override
    @Transactional
    public KitSize saveKitSize(KitSize kitSize) {
        return kitSizeRepository.save(kitSize);
    }

    @Override
    @Transactional
    public void deleteKitSize(Long id) {
        if (!kitSizeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Kit size not found with ID: " + id);
        }
        kitSizeRepository.deleteById(id);
    }
}
