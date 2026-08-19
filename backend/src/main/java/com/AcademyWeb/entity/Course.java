package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "course")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "course_name", nullable = false, length = 100)
    private String courseName;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "fees", nullable = false, precision = 10, scale = 2)
    private BigDecimal fees;

    @Column(name = "description", length = 500)
    private String description;
}
