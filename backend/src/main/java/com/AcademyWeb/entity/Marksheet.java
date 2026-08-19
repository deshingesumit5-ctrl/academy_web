package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marksheet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marksheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "marksheet_id")
    private Long marksheetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(name = "admission_type", length = 50)
    private String admissionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id")
    private ExamMaster exam;

    @Column(name = "file_url", length = 255)
    private String fileUrl;

    @Column(name = "file_name", length = 100)
    private String fileName;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
