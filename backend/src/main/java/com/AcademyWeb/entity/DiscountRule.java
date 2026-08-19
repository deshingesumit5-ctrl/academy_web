package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "discount_rule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_rule_id")
    private Long discountRuleId;

    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;

    @Column(name = "fee_type", nullable = false, length = 20)
    private String feeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academy_fee_plan_id")
    private AcademyFeePlan academyFeePlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_fee_plan_id")
    private LibraryFeePlan libraryFeePlan;

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
