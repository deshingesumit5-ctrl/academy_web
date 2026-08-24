package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Caste;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasteRepository extends JpaRepository<Caste, Long> {
    List<Caste> findByStatus(String status);
}
