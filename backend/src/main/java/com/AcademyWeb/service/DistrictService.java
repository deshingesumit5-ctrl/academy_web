package com.AcademyWeb.service;

import com.AcademyWeb.entity.District;
import java.util.List;

public interface DistrictService {
    List<District> getAllDistricts();
    List<District> getActiveDistricts();
    District saveDistrict(District district);
    void deleteDistrict(Long id);
}
