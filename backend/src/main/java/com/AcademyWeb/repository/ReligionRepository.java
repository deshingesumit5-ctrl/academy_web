package com.AcademyWeb.repository;

import com.AcademyWeb.entity.Religion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReligionRepository extends JpaRepository<Religion, Long> {
    List<Religion> findByStatus(String status);
}
