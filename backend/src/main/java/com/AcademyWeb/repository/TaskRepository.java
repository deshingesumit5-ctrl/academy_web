package com.AcademyWeb.repository;

import com.AcademyWeb.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<TaskEntity, Long> {
    List<TaskEntity> findByDueDate(LocalDate date);
}
