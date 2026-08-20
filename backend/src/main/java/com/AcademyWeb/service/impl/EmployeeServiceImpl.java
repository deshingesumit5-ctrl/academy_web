package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.EmployeeDto;
import com.AcademyWeb.entity.Employee;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.EmployeeRepository;
import com.AcademyWeb.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee entity = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(entity);
    }

    @Override
    public EmployeeDto createEmployee(EmployeeDto dto) {
        Employee entity = mapToEntity(dto);
        Employee saved = employeeRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        Employee entity = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        entity.setEmployeeName(dto.getEmployeeName());
        entity.setGender(dto.getGender());
        entity.setDob(dto.getDob());
        entity.setMobileNumber(dto.getMobileNumber());
        entity.setEmailId(dto.getEmailId());
        entity.setAadhaarNumber(dto.getAadhaarNumber());
        entity.setPanNumber(dto.getPanNumber());
        entity.setBloodGroup(dto.getBloodGroup());
        entity.setAddress(dto.getAddress());
        entity.setDesignation(dto.getDesignation());
        entity.setDateOfJoining(dto.getDateOfJoining());
        entity.setShift(dto.getShift());
        entity.setStatus(dto.getStatus());
        entity.setEmployeePhoto(dto.getEmployeePhoto());

        Employee saved = employeeRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    public void deleteEmployee(Long id) {
        Employee entity = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        employeeRepository.delete(entity);
    }

    private EmployeeDto mapToDto(Employee entity) {
        return EmployeeDto.builder()
                .employeeId(entity.getEmployeeId())
                .employeeName(entity.getEmployeeName())
                .gender(entity.getGender())
                .dob(entity.getDob())
                .mobileNumber(entity.getMobileNumber())
                .emailId(entity.getEmailId())
                .aadhaarNumber(entity.getAadhaarNumber())
                .panNumber(entity.getPanNumber())
                .bloodGroup(entity.getBloodGroup())
                .address(entity.getAddress())
                .designation(entity.getDesignation())
                .dateOfJoining(entity.getDateOfJoining())
                .shift(entity.getShift())
                .status(entity.getStatus() != null ? entity.getStatus() : "Active")
                .employeePhoto(entity.getEmployeePhoto())
                .build();
    }

    private Employee mapToEntity(EmployeeDto dto) {
        return Employee.builder()
                .employeeId(dto.getEmployeeId())
                .employeeName(dto.getEmployeeName())
                .gender(dto.getGender())
                .dob(dto.getDob())
                .mobileNumber(dto.getMobileNumber())
                .emailId(dto.getEmailId())
                .aadhaarNumber(dto.getAadhaarNumber())
                .panNumber(dto.getPanNumber())
                .bloodGroup(dto.getBloodGroup())
                .address(dto.getAddress())
                .designation(dto.getDesignation())
                .dateOfJoining(dto.getDateOfJoining())
                .shift(dto.getShift())
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .employeePhoto(dto.getEmployeePhoto())
                .build();
    }
}
