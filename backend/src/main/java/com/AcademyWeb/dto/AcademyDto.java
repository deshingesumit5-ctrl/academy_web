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
public class AcademyDto {
    private Long academyId;

    @NotBlank(message = "Academy name is required")
    private String academyName;

    @NotBlank(message = "Branch name is required")
    private String branchName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Contact details are required")
    private String contactNumber;

    private LocalDateTime createdAt;
}
