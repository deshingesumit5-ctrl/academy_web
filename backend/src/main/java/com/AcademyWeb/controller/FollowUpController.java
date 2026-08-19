package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.FollowUpDto;
import com.AcademyWeb.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/followups")
public class FollowUpController {

    @Autowired
    private FollowUpService followUpService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getAllFollowUps() {
        return ResponseEntity.ok(ApiResponse.success("Follow-ups retrieved successfully", followUpService.getAllFollowUps()));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getTodayFollowUps() {
        return ResponseEntity.ok(ApiResponse.success("Today's follow-ups retrieved successfully", followUpService.getTodayFollowUps()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getUpcomingFollowUps() {
        return ResponseEntity.ok(ApiResponse.success("Upcoming follow-ups retrieved successfully", followUpService.getUpcomingFollowUps()));
    }

    @GetMapping("/missed")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getMissedFollowUps() {
        return ResponseEntity.ok(ApiResponse.success("Missed follow-ups retrieved successfully", followUpService.getMissedFollowUps()));
    }

    @GetMapping("/inquiry/{inquiryId}")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getFollowUpsByInquiry(@PathVariable Long inquiryId) {
        return ResponseEntity.ok(ApiResponse.success("Inquiry follow-up history retrieved successfully", followUpService.getFollowUpsByInquiry(inquiryId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FollowUpDto>> createFollowUp(@RequestBody FollowUpDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Follow-up created successfully", followUpService.createFollowUp(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FollowUpDto>> updateFollowUp(@PathVariable Long id, @RequestBody FollowUpDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Follow-up updated successfully", followUpService.updateFollowUp(id, dto)));
    }

    @PatchMapping("/{id}/mark-done")
    public ResponseEntity<ApiResponse<FollowUpDto>> markDone(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.get("discussionNotes") : null;
        return ResponseEntity.ok(ApiResponse.success("Follow-up marked as done", followUpService.markDone(id, notes)));
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<FollowUpDto>> reschedule(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LocalDate newDate = body.get("followupDate") != null ? LocalDate.parse(body.get("followupDate")) : null;
        LocalTime newTime = body.get("followupTime") != null && !body.get("followupTime").isEmpty() ? LocalTime.parse(body.get("followupTime")) : null;
        return ResponseEntity.ok(ApiResponse.success("Follow-up rescheduled successfully", followUpService.reschedule(id, newDate, newTime)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFollowUp(@PathVariable Long id) {
        followUpService.deleteFollowUp(id);
        return ResponseEntity.ok(ApiResponse.success("Follow-up deleted successfully", null));
    }
}
