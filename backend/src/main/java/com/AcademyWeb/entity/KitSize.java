package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "kit_sizes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KitSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kit_size_id")
    private Long kitSizeId;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "status", length = 20)
    private String status = "Active";
}
