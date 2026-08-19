package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceDto {
    private Long attendanceId;
    private Long studentId;
    private String admissionNumber;
    private String studentName;
    private String batchName;
    private LocalDate attendanceDate;
    private LocalTime timeIn;
    private LocalTime timeOut;
    private String status; // PRESENT, ABSENT, LATE
    private String deviceMode;
}
