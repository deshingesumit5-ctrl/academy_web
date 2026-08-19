package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "admission_number", unique = true, length = 50)
    private String admissionNumber;

    @Column(name = "student_name", nullable = false, length = 100)
    private String studentName;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "mobile_number", length = 15)
    private String mobileNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "aadhaar_number", length = 20)
    private String aadhaarNumber;

    @Column(name = "photo_url", columnDefinition = "VARCHAR(MAX)")
    private String photoUrl;

    // Parent Info
    @Column(name = "father_name", length = 100)
    private String fatherName;

    @Column(name = "mother_name", length = 100)
    private String motherName;

    @Column(name = "parent_mobile", length = 15)
    private String parentMobile;

    @Column(name = "parent_email", length = 100)
    private String parentEmail;

    // Educational Info
    @Column(name = "school_college", length = 150)
    private String schoolCollege;

    @Column(name = "qualification", length = 100)
    private String qualification;

    @Column(name = "current_standard", length = 50)
    private String currentStandard;

    // Admission Details
    @Column(name = "admission_type", length = 50) // ACADEMY, LIBRARY, ACADEMY_LIBRARY
    private String admissionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private LibraryPlan libraryPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "status", length = 30) // ACTIVE, INACTIVE, COMPLETED
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
