package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    List<Inquiry> findByStatus(String status);
    long countByStatus(String status);
}
