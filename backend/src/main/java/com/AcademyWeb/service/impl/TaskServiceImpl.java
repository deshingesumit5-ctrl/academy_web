package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.TaskDto;
import com.AcademyWeb.entity.TaskEntity;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.TaskRepository;
import com.AcademyWeb.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    private TaskDto mapToDto(TaskEntity entity) {
        return TaskDto.builder()
                .taskId(entity.getTaskId())
                .taskTitle(entity.getTaskTitle())
                .taskType(entity.getTaskType())
                .description(entity.getDescription())
                .assignedTo(entity.getAssignedTo())
                .priority(entity.getPriority())
                .dueDate(entity.getDueDate())
                .status(entity.getStatus())
                .sendViaWhatsApp(entity.getSendViaWhatsApp())
                .recurrenceType(entity.getRecurrenceType())
                .recurrenceDay(entity.getRecurrenceDay())
                .recurrenceDate(entity.getRecurrenceDate())
                .build();
    }

    private TaskEntity mapToEntity(TaskDto dto) {
        return TaskEntity.builder()
                .taskId(dto.getTaskId())
                .taskTitle(dto.getTaskTitle())
                .taskType(dto.getTaskType())
                .description(dto.getDescription())
                .assignedTo(dto.getAssignedTo())
                .priority(dto.getPriority())
                .dueDate(dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "Pending")
                .sendViaWhatsApp(dto.getSendViaWhatsApp() != null ? dto.getSendViaWhatsApp() : false)
                .recurrenceType(dto.getRecurrenceType() != null ? dto.getRecurrenceType() : "ONE_TIME")
                .recurrenceDay(dto.getRecurrenceDay())
                .recurrenceDate(dto.getRecurrenceDate())
                .build();
    }

    @Override
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskDto createTask(TaskDto dto) {
        TaskEntity entity = mapToEntity(dto);
        TaskEntity saved = taskRepository.save(entity);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public TaskDto updateTask(Long id, TaskDto dto) {
        TaskEntity existing = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));

        existing.setTaskTitle(dto.getTaskTitle());
        existing.setTaskType(dto.getTaskType());
        existing.setDescription(dto.getDescription());
        existing.setAssignedTo(dto.getAssignedTo());
        existing.setPriority(dto.getPriority());
        existing.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }
        if (dto.getSendViaWhatsApp() != null) {
            existing.setSendViaWhatsApp(dto.getSendViaWhatsApp());
        }
        if (dto.getRecurrenceType() != null) {
            existing.setRecurrenceType(dto.getRecurrenceType());
        }
        existing.setRecurrenceDay(dto.getRecurrenceDay());
        existing.setRecurrenceDate(dto.getRecurrenceDate());

        TaskEntity updated = taskRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with ID: " + id);
        }
        taskRepository.deleteById(id);
    }
}
