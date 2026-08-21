package com.AcademyWeb.repository;

import com.AcademyWeb.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    
    @Query("SELECT SUM(f.amountPaid) FROM FeePayment f WHERE f.paymentDate = :date")
    BigDecimal sumAmountPaidByDate(LocalDate date);

    @Query("SELECT SUM(f.amountPaid) FROM FeePayment f WHERE MONTH(f.paymentDate) = :month AND YEAR(f.paymentDate) = :year")
    BigDecimal sumAmountPaidByMonthAndYear(int month, int year);

      long countByPaymentDate(LocalDate paymentDate);

    @Query("SELECT f.student.studentId, SUM(f.amountPaid) FROM FeePayment f GROUP BY f.student.studentId")
    List<Object[]> sumAmountPaidGroupByStudent();

    List<FeePayment> findByStudentStudentIdOrderByPaymentDateAscPaymentIdAsc(Long studentId);
}

