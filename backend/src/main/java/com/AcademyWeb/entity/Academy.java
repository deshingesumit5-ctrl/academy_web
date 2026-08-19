package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "academy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Academy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "academy_id")
    private Long academyId;

    @Column(name = "academy_name", nullable = false, length = 150)
    private String academyName;

    @Column(name = "branch_name", length = 100)
    private String branchName;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "contact_number", length = 15)
    private String contactNumber;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
