package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryPlanDto {
    private Long planId;

    @NotBlank(message = "Plan name is required")
    private String planName;

    private String duration;

    @NotNull(message = "Fees are required")
    private BigDecimal fees;

    private String description;
}
