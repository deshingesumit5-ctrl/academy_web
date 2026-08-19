package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "academy_fee_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademyFeePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "academy_fee_plan_id")
    private Long academyFeePlanId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(name = "total_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFee;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
