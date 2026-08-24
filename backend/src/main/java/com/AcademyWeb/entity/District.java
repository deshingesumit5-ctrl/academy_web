package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "districts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "district_id")
    private Long districtId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "status", length = 20)
    private String status = "Active";
}
