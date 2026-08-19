package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarksheetDto {
    private Long marksheetId;
    private Long studentId;
    private String studentName;
    private String admissionNumber;
    private Long batchId;
    private String batchName;
    private String admissionType;
    private Long examId;
    private String examName;
    private String fileUrl;
    private String fileName;
    private LocalDateTime createdAt;
}
