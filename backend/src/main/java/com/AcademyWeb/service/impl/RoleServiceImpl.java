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

        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        String trimmedEmail = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(trimmedEmail)) {
            throw new BadRequestException("Email already registered with another user/role");
        }

        if (dto.getPassword() == null || dto.getPassword().trim().length() < 8) {
            throw new BadRequestException("Password is required and must be at least 8 characters");
        }
        if (dto.getConfirmPassword() != null && !dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
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

        // Save UserEntity linked 1:1 to role
        boolean isActive = "Active".equalsIgnoreCase(status);
        String hashed = passwordEncoder.encode(dto.getPassword().trim());

        UserEntity userEntity = UserEntity.builder()
                .username(trimmedEmail)
                .email(trimmedEmail)
                .fullName(trimmedName)
                .password(hashed)
                .role(trimmedName.toUpperCase().replace(" ", "_"))
                .roleEntity(savedRole)
                .isActive(isActive)
                .build();

        userRepository.save(userEntity);

        return mapToDto(savedRole);
    }

    @Override
    @Transactional
    public RoleDto updateRole(Long roleId, RoleCreateEditDto dto) {
        RoleEntity roleEntity = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));

        if (isSuperAdminRole(roleEntity.getName())) {
            // Prevent changing name or status of Super Admin role if system built-in
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

        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        String trimmedEmail = dto.getEmail().trim().toLowerCase();

        // Find linked user for this role
        Optional<UserEntity> userOpt = userRepository.findFirstByRoleEntity_RoleId(roleId);
        UserEntity userEntity;
        if (userOpt.isPresent()) {
            userEntity = userOpt.get();
            if (userRepository.existsByEmailAndUserIdNot(trimmedEmail, userEntity.getUserId())) {
                throw new BadRequestException("Email already in use by another account");
            }
        } else {
            if (userRepository.existsByEmail(trimmedEmail)) {
                throw new BadRequestException("Email already in use by another account");
            }
            userEntity = new UserEntity();
            userEntity.setRoleEntity(roleEntity);
        }

        // Check password match if password provided
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty() && !"••••••••".equals(dto.getPassword().trim())) {
            if (dto.getPassword().trim().length() < 8) {
                throw new BadRequestException("Password must be at least 8 characters");
            }
            if (dto.getConfirmPassword() != null && !dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new BadRequestException("Password and Confirm Password do not match");
            }
            userEntity.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }

        String status = (dto.getStatus() != null && !dto.getStatus().trim().isEmpty())
                ? dto.getStatus().trim()
                : "Active";

        // Update RoleEntity
        roleEntity.setName(trimmedName);
        roleEntity.setDescription(dto.getDescription());
        roleEntity.setStatus(status);
        if (dto.getPermissions() != null) {
            roleEntity.setPermissions(dto.getPermissions());
        }
        RoleEntity updatedRole = roleRepository.save(roleEntity);

        // Update UserEntity
        userEntity.setUsername(trimmedEmail);
        userEntity.setEmail(trimmedEmail);
        userEntity.setFullName(trimmedName);
        userEntity.setRole(trimmedName.toUpperCase().replace(" ", "_"));
        userEntity.setIsActive("Active".equalsIgnoreCase(status));
        userRepository.save(userEntity);

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

        // Delete associated users
        userRepository.findAllByRoleEntity_RoleId(roleId).forEach(user -> {
            userRepository.delete(user);
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
