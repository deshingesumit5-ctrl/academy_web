package com.AcademyWeb.service;

import com.AcademyWeb.dto.FollowUpDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface FollowUpService {
    List<FollowUpDto> getAllFollowUps();
    List<FollowUpDto> getTodayFollowUps();
    List<FollowUpDto> getUpcomingFollowUps();
    List<FollowUpDto> getMissedFollowUps();
    List<FollowUpDto> getFollowUpsByInquiry(Long inquiryId);
    FollowUpDto createFollowUp(FollowUpDto dto);
    FollowUpDto updateFollowUp(Long id, FollowUpDto dto);
    FollowUpDto markDone(Long id, String discussionNotes);
    FollowUpDto reschedule(Long id, LocalDate newDate, LocalTime newTime);
    void deleteFollowUp(Long id);
}
