package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "installment_plan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "installment_plan_id")
    private Long installmentPlanId;

    @Column(name = "fee_type", nullable = false, length = 20)
    private String feeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academy_fee_plan_id")
    private AcademyFeePlan academyFeePlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_fee_plan_id")
    private LibraryFeePlan libraryFeePlan;

    @Column(name = "num_installments", nullable = false)
    private Integer numInstallments;

    @Column(name = "installment_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal installmentAmount;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
