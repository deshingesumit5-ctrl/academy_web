package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.UserMasterDto;
import com.AcademyWeb.entity.Employee;
import com.AcademyWeb.entity.RoleEntity;
import com.AcademyWeb.entity.UserEntity;
import com.AcademyWeb.exception.BadRequestException;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.EmployeeRepository;
import com.AcademyWeb.repository.RoleRepository;
import com.AcademyWeb.repository.UserRepository;
import com.AcademyWeb.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserMasterDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserMasterDto getUserById(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Override
    @Transactional
    public UserMasterDto createUser(UserMasterDto dto) {
        if (dto.getEmail() == null || dto.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered with another user");
        }

        Employee employee = null;
        if (dto.getEmployeeId() != null) {
            employee = employeeRepository.findById(dto.getEmployeeId()).orElse(null);
        }

        RoleEntity roleEntity = null;
        if (dto.getRoleId() != null) {
            roleEntity = roleRepository.findById(dto.getRoleId()).orElse(null);
        }

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty())
                ? dto.getPassword().trim()
                : "123456";

        String roleName = roleEntity != null ? roleEntity.getName() : "User";
        String fullName = employee != null ? employee.getEmployeeName() : (dto.getEmployeeName() != null ? dto.getEmployeeName() : roleName);

        UserEntity user = UserEntity.builder()
                .username(email)
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(rawPassword))
                .role(roleName.toUpperCase().replace(" ", "_"))
                .roleEntity(roleEntity)
                .employee(employee)
                .description(dto.getDescription())
                .isActive(!"Inactive".equalsIgnoreCase(dto.getStatus()))
                .build();

        UserEntity saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public UserMasterDto updateUser(Long id, UserMasterDto dto) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            String email = dto.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmailAndUserIdNot(email, id)) {
                throw new BadRequestException("Email already in use by another account");
            }
            user.setEmail(email);
            user.setUsername(email);
        }

        if (dto.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId()).orElse(null);
            user.setEmployee(employee);
            if (employee != null) {
                user.setFullName(employee.getEmployeeName());
            }
        }

        if (dto.getRoleId() != null) {
            RoleEntity roleEntity = roleRepository.findById(dto.getRoleId()).orElse(null);
            user.setRoleEntity(roleEntity);
            if (roleEntity != null) {
                user.setRole(roleEntity.getName().toUpperCase().replace(" ", "_"));
            }
        }

        if (dto.getDescription() != null) {
            user.setDescription(dto.getDescription());
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty() && !"••••••••".equals(dto.getPassword().trim())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }

        if (dto.getStatus() != null) {
            user.setIsActive("Active".equalsIgnoreCase(dto.getStatus()));
        }

        UserEntity saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        userRepository.delete(user);
    }

    private UserMasterDto mapToDto(UserEntity user) {
        Long empId = null;
        String empName = user.getFullName();
        try {
            if (user.getEmployee() != null) {
                empId = user.getEmployee().getEmployeeId();
                if (user.getEmployee().getEmployeeName() != null) {
                    empName = user.getEmployee().getEmployeeName();
                }
            }
        } catch (Exception ignored) {
        }
        Long rId = user.getRoleEntity() != null ? user.getRoleEntity().getRoleId() : null;
        String rName = user.getRoleEntity() != null ? user.getRoleEntity().getName() : user.getRole();

        return UserMasterDto.builder()
                .userId(user.getUserId())
                .employeeId(empId)
                .employeeName(empName)
                .roleId(rId)
                .roleName(rName)
                .description(user.getDescription() != null ? user.getDescription() : "")
                .email(user.getEmail())
                .password("••••••••")
                .status(Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Inactive")
                .build();
    }
}
