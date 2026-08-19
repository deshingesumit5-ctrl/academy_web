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
public class ExamDto {
    private Long examId;

    @NotBlank(message = "Exam name is required")
    private String examName;

    private String examType;
}
