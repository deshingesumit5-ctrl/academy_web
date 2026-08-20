package com.AcademyWeb.service;

import com.AcademyWeb.dto.BloodGroupDto;
import java.util.List;

public interface BloodGroupService {
    List<BloodGroupDto> getAllBloodGroups();
    BloodGroupDto getBloodGroupById(Long id);
    BloodGroupDto createBloodGroup(BloodGroupDto dto);
    BloodGroupDto updateBloodGroup(Long id, BloodGroupDto dto);
    void deleteBloodGroup(Long id);
}
