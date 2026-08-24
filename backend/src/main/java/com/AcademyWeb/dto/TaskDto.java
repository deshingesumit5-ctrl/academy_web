package com.AcademyWeb.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private Long taskId;

    @NotBlank(message = "Task title is required")
    private String taskTitle;

    private String taskType; // Daily, One-Time, Meeting, Personal
    private String description;
    private String assignedTo;
    private String priority; // High, Medium, Low
    private LocalDate dueDate;
    private String status; // Pending, Done, Scheduled
    private Boolean sendViaWhatsApp;
    private java.util.List<Long> assignedEmployeeIds;
    private String recurrenceType; // ONE_TIME, DAILY, WEEKLY, MONTHLY
    private String recurrenceDay; // Monday, Tuesday, etc.
    private Integer recurrenceDate; // 1 to 31
}
