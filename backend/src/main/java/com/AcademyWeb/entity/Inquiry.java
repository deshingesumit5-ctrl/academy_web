package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Long inquiryId;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(name = "parent_name", length = 100)
    private String parentName;

    @Column(name = "mobile_number", nullable = false, length = 15)
    private String mobileNumber;

    @Column(name = "interested_course", length = 100)
    private String interestedCourse;

    @Column(name = "admission_type", length = 50)
    private String admissionType;

    @Column(name = "inquiry_source", length = 100)
    private String inquirySource;

    @Column(name = "counselor_assigned", length = 100)
    private String counselorAssigned;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "status", nullable = false, length = 30) // Open, Follow-up, Converted, Lost
    private String status = "Open";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
