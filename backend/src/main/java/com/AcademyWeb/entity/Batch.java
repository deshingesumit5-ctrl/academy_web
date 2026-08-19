package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "batch")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "batch_name", nullable = false, length = 100)
    private String batchName;

    @Column(name = "faculty", length = 100)
    private String faculty;

    @Column(name = "batch_timing", length = 50)
    private String batchTiming;

    @Column(name = "capacity")
    private Integer capacity;
}
