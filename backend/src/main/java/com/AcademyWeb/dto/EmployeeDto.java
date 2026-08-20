package com.AcademyWeb.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Long employeeId;
    private String employeeName;
    private String gender;
    private String dob;
    private String mobileNumber;
    private String emailId;
    private String aadhaarNumber;
    private String panNumber;
    private String bloodGroup;
    private String address;
    private String designation;
    private String dateOfJoining;
    private String shift;
    private String status;
    private String employeePhoto;
}
