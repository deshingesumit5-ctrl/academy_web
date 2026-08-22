package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.RoleCreateEditDto;
import com.AcademyWeb.dto.RoleDto;
import com.AcademyWeb.entity.RoleEntity;
import com.AcademyWeb.entity.UserEntity;
import com.AcademyWeb.exception.BadRequestException;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.RoleRepository;
import com.AcademyWeb.repository.UserRepository;
import com.AcademyWeb.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<RoleDto> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RoleDto getRoleById(Long roleId) {
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        return mapToDto(roleEntity);
    }

    @Override
    @Transactional
    public RoleDto createRole(RoleCreateEditDto dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Role name is required");
        }
        String trimmedName = dto.getName().trim();
        if (roleRepository.existsByName(trimmedName)) {
            throw new BadRequestException("Role name already exists");
        }

        String status = (dto.getStatus() != null && !dto.getStatus().trim().isEmpty())
                ? dto.getStatus().trim()
                : "Active";

        // Save RoleEntity
        RoleEntity roleEntity = RoleEntity.builder()
                .name(trimmedName)
                .description(dto.getDescription())
                .status(status)
                .permissions(dto.getPermissions())
                .build();

        RoleEntity savedRole = roleRepository.save(roleEntity);
        return mapToDto(savedRole);
    }

    @Override
    @Transactional
    public RoleDto updateRole(Long roleId, RoleCreateEditDto dto) {
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        if (isSuperAdminRole(roleEntity.getName())) {
            if (dto.getStatus() != null && "Inactive".equalsIgnoreCase(dto.getStatus())) {
                throw new BadRequestException("Super Admin role cannot be set to Inactive");
            }
        }

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Role name is required");
        }
        String trimmedName = dto.getName().trim();
        if (roleRepository.existsByNameAndRoleIdNot(trimmedName, roleId)) {
            throw new BadRequestException("Role name already in use by another role");
        }

        String status = (dto.getStatus() != null && !dto.getStatus().trim().isEmpty())
                ? dto.getStatus().trim()
                : "Active";

        roleEntity.setName(trimmedName);
        roleEntity.setDescription(dto.getDescription());
        roleEntity.setStatus(status);
        if (dto.getPermissions() != null) {
            roleEntity.setPermissions(dto.getPermissions());
        }
        RoleEntity updatedRole = roleRepository.save(roleEntity);

        return mapToDto(updatedRole);
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) {
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        if (isSuperAdminRole(roleEntity.getName())) {
            throw new BadRequestException("Super Admin role cannot be deleted");
        }

        // Unlink associated users before deleting role
        userRepository.findAllByRoleEntity_RoleId(roleId).forEach(user -> {
            user.setRoleEntity(null);
            userRepository.save(user);
        });

        roleRepository.delete(roleEntity);
    }

    private boolean isSuperAdminRole(String name) {
        return "Super Admin".equalsIgnoreCase(name) || "SUPER_ADMIN".equalsIgnoreCase(name);
    }

    private RoleDto mapToDto(RoleEntity roleEntity) {
        Optional<UserEntity> userOpt = userRepository.findFirstByRoleEntity_RoleId(roleEntity.getRoleId());
        
        return RoleDto.builder()
                .roleId(roleEntity.getRoleId())
                .name(roleEntity.getName())
                .description(roleEntity.getDescription())
                .status(roleEntity.getStatus())
                .permissions(roleEntity.getPermissions())
                .userId(userOpt.map(UserEntity::getUserId).orElse(null))
                .email(userOpt.map(UserEntity::getEmail).orElse(""))
                .username(userOpt.map(UserEntity::getUsername).orElse(""))
                .createdAt(roleEntity.getCreatedAt())
                .updatedAt(roleEntity.getUpdatedAt())
                .build();
    }
}
