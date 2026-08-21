package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.FollowUp;
import com.AcademyWeb.entity.Inquiry;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.FollowUpRepository;
import com.AcademyWeb.repository.InquiryRepository;
import com.AcademyWeb.dto.FollowUpDto;
import com.AcademyWeb.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class FollowUpServiceImpl implements FollowUpService {

    @Autowired
    private FollowUpRepository followupRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    private FollowUpDto mapToDto(FollowUp entity) {
        LocalDate today = LocalDate.now();
        String category = "Today";
        if (entity.getFollowupDate() != null) {
            if (entity.getFollowupDate().isAfter(today)) {
                category = "Upcoming";
            } else if (entity.getFollowupDate().isBefore(today)) {
                category = "Missed";
            }
        }
        return FollowUpDto.builder()
                .followupId(entity.getFollowupId())
                .inquiryId(entity.getInquiry() != null ? entity.getInquiry().getInquiryId() : null)
                .studentName(entity.getInquiry() != null ? entity.getInquiry().getStudentName() : null)
                .mobileNumber(entity.getInquiry() != null ? entity.getInquiry().getMobileNumber() : null)
                .interestedCourse(entity.getInquiry() != null ? entity.getInquiry().getInterestedCourse() : null)
                .followupDate(entity.getFollowupDate())
                .followupTime(entity.getFollowupTime())
                .discussionNotes(entity.getDiscussionNotes())
                .nextFollowupDate(entity.getNextFollowupDate())
                .counselor(entity.getCounselor() != null ? entity.getCounselor() : (entity.getInquiry() != null ? entity.getInquiry().getCounselorAssigned() : null))
                .status(entity.getStatus())
                .category(category)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    @Override
    public List<FollowUpDto> getAllFollowUps() {
        return followupRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowUpDto> getTodayFollowUps() {
        LocalDate today = LocalDate.now();
        return followupRepository.findByFollowupDateAndStatusOrderByFollowupTimeAsc(today, "Pending").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowUpDto> getUpcomingFollowUps() {
        LocalDate today = LocalDate.now();
        return followupRepository.findByFollowupDateAfterAndStatusOrderByFollowupDateAscFollowupTimeAsc(today, "Pending").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowUpDto> getMissedFollowUps() {
        LocalDate today = LocalDate.now();
        return followupRepository.findByFollowupDateBeforeAndStatusOrderByFollowupDateAscFollowupTimeAsc(today, "Pending").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowUpDto> getFollowUpsByInquiry(Long inquiryId) {
        return followupRepository.findByInquiryInquiryIdOrderByFollowupDateDescFollowupTimeDesc(inquiryId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FollowUpDto createFollowUp(FollowUpDto dto) {
        Inquiry inquiry = null;
        if (dto.getInquiryId() != null) {
            inquiry = inquiryRepository.findById(dto.getInquiryId()).orElse(null);
            if (inquiry != null && !"Follow-up".equalsIgnoreCase(inquiry.getStatus())) {
                inquiry.setStatus("Follow-up");
                inquiryRepository.save(inquiry);
            }
        }

        String counselor = dto.getCounselor();
        if ((counselor == null || counselor.trim().isEmpty()) && inquiry != null) {
            counselor = inquiry.getCounselorAssigned();
        }

        FollowUp followUp = FollowUp.builder()
                .inquiry(inquiry)
                .followupDate(dto.getFollowupDate() != null ? dto.getFollowupDate() : LocalDate.now())
                .followupTime(dto.getFollowupTime())
                .discussionNotes(dto.getDiscussionNotes())
                .nextFollowupDate(dto.getNextFollowupDate())
                .counselor(counselor)
                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                .build();

        FollowUp saved = followupRepository.save(followUp);

        // TASK 2: If "Next follow-up date" is filled in, also create a second follow_up row
        // for that future date with status = "Pending" (so it appears in Upcoming automatically).
        if (dto.getNextFollowupDate() != null) {
            FollowUp nextFollowUp = FollowUp.builder()
                    .inquiry(inquiry)
                    .followupDate(dto.getNextFollowupDate())
                    .followupTime(dto.getFollowupTime())
                    .discussionNotes(dto.getDiscussionNotes() != null ? "Follow-up scheduled from previous note: " + dto.getDiscussionNotes() : "Next follow-up scheduled")
                    .nextFollowupDate(null)
                    .counselor(counselor)
                    .status("Pending")
                    .build();
            followupRepository.save(nextFollowUp);
        }

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FollowUpDto updateFollowUp(Long id, FollowUpDto dto) {
        FollowUp existing = followupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FollowUp not found with ID: " + id));

        if (dto.getFollowupDate() != null) {
            existing.setFollowupDate(dto.getFollowupDate());
        }
        if (dto.getFollowupTime() != null) {
            existing.setFollowupTime(dto.getFollowupTime());
        }
        if (dto.getDiscussionNotes() != null) {
            existing.setDiscussionNotes(dto.getDiscussionNotes());
        }
        existing.setNextFollowupDate(dto.getNextFollowupDate());
        if (dto.getCounselor() != null) {
            existing.setCounselor(dto.getCounselor());
        }
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        FollowUp updated = followupRepository.save(existing);

        // If nextFollowupDate is set during update, also create the future follow-up entry if needed
        if (dto.getNextFollowupDate() != null) {
            FollowUp nextFollowUp = FollowUp.builder()
                    .inquiry(existing.getInquiry())
                    .followupDate(dto.getNextFollowupDate())
                    .followupTime(existing.getFollowupTime())
                    .discussionNotes(existing.getDiscussionNotes() != null ? "Scheduled: " + existing.getDiscussionNotes() : "Next follow-up scheduled")
                    .counselor(existing.getCounselor())
                    .status("Pending")
                    .build();
            followupRepository.save(nextFollowUp);
        }

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public FollowUpDto markDone(Long id, String discussionNotes) {
        FollowUp existing = followupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FollowUp not found with ID: " + id));

        existing.setStatus("Done");
        if (discussionNotes != null && !discussionNotes.trim().isEmpty()) {
            existing.setDiscussionNotes(discussionNotes);
        }
        FollowUp saved = followupRepository.save(existing);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public FollowUpDto reschedule(Long id, LocalDate newDate, LocalTime newTime) {
        FollowUp existing = followupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FollowUp not found with ID: " + id));

        if (newDate != null) {
            existing.setFollowupDate(newDate);
        }
        if (newTime != null) {
            existing.setFollowupTime(newTime);
        }
        existing.setStatus("Pending");
        FollowUp saved = followupRepository.save(existing);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteFollowUp(Long id) {
        if (!followupRepository.existsById(id)) {
            throw new ResourceNotFoundException("FollowUp not found with ID: " + id);
        }
        followupRepository.deleteById(id);
    }

}
