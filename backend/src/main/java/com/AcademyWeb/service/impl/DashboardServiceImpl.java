package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.DashboardStatsDto;
import com.AcademyWeb.dto.FollowUpDto;
import com.AcademyWeb.dto.TaskDto;
import com.AcademyWeb.repository.*;
import com.AcademyWeb.service.DashboardService;
import com.AcademyWeb.service.FollowUpService;
import com.AcademyWeb.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private FollowUpService followUpService;

    @Autowired
    private FollowUpRepository followUpRepository;

    @Autowired
    private TaskService taskService;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        LocalDate today = LocalDate.now();

        long activeStudents = studentRepository.countByStatus("ACTIVE");
        long presentCount = attendanceRepository.countByAttendanceDateAndStatus(today, "PRESENT");

        String attendancePct = activeStudents > 0 ? (presentCount * 100 / activeStudents) + "%" : "0%";
        String attendanceDetails = activeStudents > 0 ? presentCount + " of " + activeStudents + " present"
                : "0 of 0 present";

        BigDecimal todayCollection = feePaymentRepository.sumAmountPaidByDate(today);
        if (todayCollection == null) {
            todayCollection = BigDecimal.ZERO;
        }

        long todayPaymentsCount = feePaymentRepository.countByPaymentDate(today);

        BigDecimal monthlyRevenue = feePaymentRepository.sumAmountPaidByMonthAndYear(today.getMonthValue(),
                today.getYear());
        if (monthlyRevenue == null) {
            monthlyRevenue = BigDecimal.ZERO;
        }

        long todayAdmissions = studentRepository.countByAdmissionDate(today);

        long newStudentsThisMonth = studentRepository.countByAdmissionDateBetween(
                today.withDayOfMonth(1), today);

        List<FollowUpDto> todaysList = followUpService.getTodayFollowUps();
        List<FollowUpDto> upcomingList = followUpService.getUpcomingFollowUps();
        List<FollowUpDto> missedList = followUpService.getMissedFollowUps();

        List<FollowUpDto> todaysFollowups = new java.util.ArrayList<>();
        if (missedList != null)
            todaysFollowups.addAll(missedList);
        if (todaysList != null)
            todaysFollowups.addAll(todaysList);
        if (upcomingList != null)
            todaysFollowups.addAll(upcomingList);

        long todayFollowupsCount = followUpRepository.countByFollowupDateAndStatus(today, "Pending");
        long upcomingFollowupsCount = followUpRepository.countByFollowupDateAfterAndStatus(today, "Pending");
        long missedFollowupsCount = followUpRepository.countByFollowupDateBeforeAndStatus(today, "Pending");

        List<TaskDto> tasks = taskService.getAllTasks();

        java.util.Map<Long, BigDecimal> totalFeeByStudent = new java.util.HashMap<>();
        for (Object[] row : studentRepository.findActiveStudentTotalFees()) {
            totalFeeByStudent.put((Long) row[0], (BigDecimal) row[1]);
        }

        java.util.Map<Long, BigDecimal> paidByStudent = new java.util.HashMap<>();
        for (Object[] row : feePaymentRepository.sumAmountPaidGroupByStudent()) {
            paidByStudent.put((Long) row[0], (BigDecimal) row[1]);
        }

        BigDecimal pendingFeesAmount = BigDecimal.ZERO;
        long overdueStudentsCount = 0;
        for (java.util.Map.Entry<Long, BigDecimal> entry : totalFeeByStudent.entrySet()) {
            BigDecimal totalFee = entry.getValue();
            BigDecimal paid = paidByStudent.getOrDefault(entry.getKey(), BigDecimal.ZERO);
            BigDecimal balance = totalFee.subtract(paid);
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                pendingFeesAmount = pendingFeesAmount.add(balance);
                overdueStudentsCount++;
            }
        }        long openInquiries = inquiryRepository.countByStatus("Open");
        long followupInquiries = inquiryRepository.countByStatus("Follow-up");
        long lostInquiries = inquiryRepository.countByStatus("Lost");
        long convertedInquiries = inquiryRepository.countByStatus("Converted");
        long totalInquiries = inquiryRepository.count();

        return DashboardStatsDto.builder()
                .attendancePercentage(attendancePct)
                .attendanceDetails(attendanceDetails)
                .todayCollection(todayCollection)
                .todayPaymentsCount((int) todayPaymentsCount)
                .pendingFeesAmount(pendingFeesAmount)
                .overdueStudentsCount((int) overdueStudentsCount)
                .activeStudentsCount(activeStudents)
                .newStudentsThisMonth((int) newStudentsThisMonth)
                .todayAdmissionsCount(todayAdmissions)
                .monthlyRevenue(monthlyRevenue)
                .todaysFollowups(todaysFollowups)
                .todayFollowupsCount(todayFollowupsCount)
                .upcomingFollowupsCount(upcomingFollowupsCount)
                .missedFollowupsCount(missedFollowupsCount)
                .todaysTasks(tasks)
                .openInquiriesCount(openInquiries)
                .followupInquiriesCount(followupInquiries)
                .lostInquiriesCount(lostInquiries)
                .convertedInquiriesCount(convertedInquiries)
                .totalInquiriesCount(totalInquiries)
                .build();
    }
}
