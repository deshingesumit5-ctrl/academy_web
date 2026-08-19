package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Long examId;

    @Column(name = "exam_name", nullable = false, length = 100)
    private String examName;

    @Column(name = "exam_type", length = 50)
    private String examType;
}
