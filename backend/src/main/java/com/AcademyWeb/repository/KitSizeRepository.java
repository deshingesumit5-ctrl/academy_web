package com.AcademyWeb.repository;

import com.AcademyWeb.entity.KitSize;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KitSizeRepository extends JpaRepository<KitSize, Long> {
    List<KitSize> findByStatus(String status);
}
