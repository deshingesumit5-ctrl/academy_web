package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDto {
    private Long courseId;

    @NotBlank(message = "Course name is required")
    private String courseName;

    private String duration;

    @NotNull(message = "Fees are required")
    private BigDecimal fees;

    private String description;
}
