package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDto {
    private Long studentId;
    private String admissionNumber;

    @NotBlank(message = "Student name is required")
    private String studentName;

    private String gender;
    private LocalDate dob;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    private String email;
    private String address;
    private String aadhaarNumber;
    private String photo;
    private String photoUrl;

    // Parent Info
    private String fatherName;
    private String motherName;
    private String parentMobile;
    private String parentEmail;

    // Educational Info
    private String schoolCollege;
    private String qualification;
    private String currentStandard;

    // Admission Details
    private String admissionType; // ACADEMY, LIBRARY, ACADEMY_LIBRARY
    private Long courseId;
    private String courseName;
    private Long planId;
    private String planName;
    private Long batchId;
    private String batchName;
    private LocalDate admissionDate;
    private String status;
}
