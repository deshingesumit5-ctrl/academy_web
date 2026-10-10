package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "caste_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caste {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "caste_name", nullable = false, length = 150)
    private String casteName;

    @Column(name = "caste_name_marathi", length = 150)
    private String casteNameMarathi;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_code", length = 50)
    private String categoryCode;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "Active";

    // Backward compatibility helper methods for existing references
    public Long getCasteId() {
        return id;
    }

    public void setCasteId(Long casteId) {
        this.id = casteId;
    }

    public String getName() {
        return casteName;
    }

    public void setName(String name) {
        this.casteName = name;
    }
}
