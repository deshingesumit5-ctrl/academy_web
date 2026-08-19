package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryDto {
    private Long inquiryId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    private String parentName;

    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    private String interestedCourse;
    private String admissionType;
    private String inquirySource;
    private String counselorAssigned;
    private String remarks;
    private String status; // Open, Follow-up, Converted, Lost
    private LocalDateTime createdAt;
}
