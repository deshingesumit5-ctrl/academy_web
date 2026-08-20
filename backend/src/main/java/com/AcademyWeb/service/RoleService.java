package com.AcademyWeb.service;

import com.AcademyWeb.dto.RoleCreateEditDto;
import com.AcademyWeb.dto.RoleDto;

import java.util.List;

public interface RoleService {
    List<RoleDto> getAllRoles();
    RoleDto getRoleById(Long roleId);
    RoleDto createRole(RoleCreateEditDto dto);
    RoleDto updateRole(Long roleId, RoleCreateEditDto dto);
    void deleteRole(Long roleId);
}
