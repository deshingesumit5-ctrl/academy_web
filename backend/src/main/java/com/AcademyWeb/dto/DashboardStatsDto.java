package com.AcademyWeb.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private String attendancePercentage;
    private String attendanceDetails;
    private BigDecimal todayCollection;
    private Integer todayPaymentsCount;
    private BigDecimal pendingFeesAmount;
    private Integer overdueStudentsCount;
    private Long activeStudentsCount;
    private Integer newStudentsThisMonth;
    private Long todayAdmissionsCount;
    private BigDecimal monthlyRevenue;
    private List<FollowUpDto> todaysFollowups;
    private Long todayFollowupsCount;
    private Long upcomingFollowupsCount;
    private Long missedFollowupsCount;
    private List<TaskDto> todaysTasks;
    private Long convertedInquiriesCount;
    private Long openInquiriesCount;
    private Long followupInquiriesCount;
    private Long lostInquiriesCount;
    private Long totalInquiriesCount;
}
