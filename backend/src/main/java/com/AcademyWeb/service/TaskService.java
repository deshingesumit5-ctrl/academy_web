package com.AcademyWeb.service;

import com.AcademyWeb.dto.TaskDto;
import java.util.List;

public interface TaskService {
    List<TaskDto> getAllTasks();
    TaskDto createTask(TaskDto dto);
    TaskDto updateTask(Long id, TaskDto dto);
    void deleteTask(Long id);
}
