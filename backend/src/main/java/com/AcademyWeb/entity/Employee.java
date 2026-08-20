package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "employee_name", nullable = false, length = 150)
    private String employeeName;

    @Column(name = "gender", length = 20)
    private String gender;

    @Column(name = "dob", length = 30)
    private String dob;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Column(name = "email_id", length = 100)
    private String emailId;

    @Column(name = "aadhaar_number", length = 30)
    private String aadhaarNumber;

    @Column(name = "pan_number", length = 30)
    private String panNumber;

    @Column(name = "blood_group", length = 20)
    private String bloodGroup;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "date_of_joining", length = 30)
    private String dateOfJoining;

    @Column(name = "shift", length = 50)
    private String shift;

    @Column(name = "status", length = 20)
    private String status = "Active";

    @Column(name = "employee_photo", columnDefinition = "NVARCHAR(MAX)")
    private String employeePhoto;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
