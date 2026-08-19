package com.AcademyWeb.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_mode", nullable = false, length = 30) // Cash, UPI, Credit/Debit Card, Bank Transfer
    private String paymentMode;

    @Column(name = "payment_type", nullable = false, length = 30) // Full, Installment, Partial
    private String paymentType;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "status", nullable = false, length = 20) // Paid, Partial, Pending
    private String status;

    @Column(name = "receipt_number", length = 50)
    private String receiptNumber;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
