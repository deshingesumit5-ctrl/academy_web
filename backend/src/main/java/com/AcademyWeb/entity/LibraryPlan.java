package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "library_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LibraryPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Long planId;

    @Column(name = "plan_name", nullable = false, length = 100)
    private String planName;

    @Column(name = "duration", length = 50)
    private String duration;

    @Column(name = "fees", nullable = false, precision = 10, scale = 2)
    private BigDecimal fees;

    @Column(name = "description", length = 500)
    private String description;
}
