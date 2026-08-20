package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blood_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blood_group_id")
    private Long bloodGroupId;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "status", length = 20)
    private String status = "Active";
}
