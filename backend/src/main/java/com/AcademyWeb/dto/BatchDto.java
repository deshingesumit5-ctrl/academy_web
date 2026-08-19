package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchDto {
    private Long batchId;

    @NotBlank(message = "Batch name is required")
    private String batchName;

    private String faculty;
    private String batchTiming;
    private Integer capacity;
}
