package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademyFeePlanDto {
    private Long academyFeePlanId;
    private Long courseId;
    private String courseName;
    private String planName;
    private BigDecimal totalFee;
    private String duration;
    private String description;
    private Boolean isActive;
}
