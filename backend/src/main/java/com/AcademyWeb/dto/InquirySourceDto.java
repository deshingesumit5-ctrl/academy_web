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
public class InquirySourceDto {
    private Long sourceId;

    @NotBlank(message = "Source name is required")
    private String sourceName;
}
