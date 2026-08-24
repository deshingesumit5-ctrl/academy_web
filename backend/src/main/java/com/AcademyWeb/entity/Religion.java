package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "religions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Religion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "religion_id")
    private Long religionId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "status", length = 20)
    private String status = "Active";
}
