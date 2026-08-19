package com.AcademyWeb.repository;

import com.AcademyWeb.entity.InquirySource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InquirySourceRepository extends JpaRepository<InquirySource, Long> {
}
