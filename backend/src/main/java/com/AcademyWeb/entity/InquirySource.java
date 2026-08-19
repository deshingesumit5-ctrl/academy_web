package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inquiry_source")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquirySource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "source_name", nullable = false, length = 100)
    private String sourceName;
}
