package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "followup")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "followup_id")
    private Long followupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inquiry_id", nullable = false)
    private Inquiry inquiry;

    @Column(name = "followup_date", nullable = false)
    private LocalDate followupDate;

    @Column(name = "followup_time")
    private LocalTime followupTime;

    @Column(name = "discussion_notes", length = 500)
    private String discussionNotes;

    @Column(name = "next_followup_date")
    private LocalDate nextFollowupDate;

    @Column(name = "counselor", length = 100)
    private String counselor;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 30) // Pending, Done, Missed
    private String status = "Pending";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
