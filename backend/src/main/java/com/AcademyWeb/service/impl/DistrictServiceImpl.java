package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.District;
import com.AcademyWeb.repository.DistrictRepository;
import com.AcademyWeb.service.DistrictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DistrictServiceImpl implements DistrictService {

    @Autowired
    private DistrictRepository districtRepository;

    @Override
    public List<District> getAllDistricts() {
        return districtRepository.findAll();
    }

    @Override
    public List<District> getActiveDistricts() {
        return districtRepository.findByStatus("Active");
    }

    @Override
    public District saveDistrict(District district) {
        return districtRepository.save(district);
    }

    @Override
    public void deleteDistrict(Long id) {
        districtRepository.deleteById(id);
    }
}
