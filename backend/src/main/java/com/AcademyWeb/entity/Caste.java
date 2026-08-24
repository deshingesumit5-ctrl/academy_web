package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "castes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "caste_id")
    private Long casteId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "status", length = 20)
    private String status = "Active";
}
