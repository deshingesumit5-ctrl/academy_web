package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUpDto {
    private Long followupId;
    private Long inquiryId;
    private String studentName;
    private String mobileNumber;
    private String interestedCourse;
    private LocalDate followupDate;
    private LocalTime followupTime;
    private String discussionNotes;
    private LocalDate nextFollowupDate;
    private String counselor;
    private String status; // Pending, Done, Missed
    private String category; // Today, Upcoming, Missed
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
