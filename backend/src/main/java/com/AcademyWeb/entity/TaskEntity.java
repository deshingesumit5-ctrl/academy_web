package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "task")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "task_title", nullable = false, length = 150)
    private String taskTitle;

    @Column(name = "task_type", length = 50) // Daily, One-Time, Meeting, Personal
    private String taskType;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "priority", length = 20) // High, Medium, Low
    private String priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "status", nullable = false, length = 30) // Pending, Done, Scheduled
    private String status = "Pending";

    @Column(name = "send_via_whatsapp")
    private Boolean sendViaWhatsApp = false;

    @Column(name = "recurrence_type", length = 30) // ONE_TIME, DAILY, WEEKLY, MONTHLY
    private String recurrenceType = "ONE_TIME";

    @Column(name = "recurrence_day", length = 30) // Monday, Tuesday, etc.
    private String recurrenceDay;

    @Column(name = "recurrence_date") // 1 to 31
    private Integer recurrenceDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
