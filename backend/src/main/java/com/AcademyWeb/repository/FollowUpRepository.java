package com.AcademyWeb.repository;

import com.AcademyWeb.entity.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByFollowupDate(LocalDate date);
    
    // Today tab: follow_up_date = current date AND status = 'Pending', ordered by time asc
    List<FollowUp> findByFollowupDateAndStatusOrderByFollowupTimeAsc(LocalDate date, String status);
    
    // Upcoming tab: follow_up_date > current date AND status = 'Pending', ordered by date asc, time asc
    List<FollowUp> findByFollowupDateAfterAndStatusOrderByFollowupDateAscFollowupTimeAsc(LocalDate date, String status);
    
    // Missed tab: follow_up_date < current date AND status = 'Pending', ordered by date asc, time asc
    List<FollowUp> findByFollowupDateBeforeAndStatusOrderByFollowupDateAscFollowupTimeAsc(LocalDate date, String status);
    
    // History timeline for an inquiry: ordered newest first
    List<FollowUp> findByInquiryInquiryIdOrderByFollowupDateDescFollowupTimeDesc(Long inquiryId);
    
    // Count queries for Dashboard stats
    long countByFollowupDateAndStatus(LocalDate date, String status);
    long countByFollowupDateAfterAndStatus(LocalDate date, String status);
    long countByFollowupDateBeforeAndStatus(LocalDate date, String status);
}
