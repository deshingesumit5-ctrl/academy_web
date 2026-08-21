package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.CourseDto;
import com.AcademyWeb.entity.Course;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.CourseRepository;
import com.AcademyWeb.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    private CourseDto mapToDto(Course entity) {
        return CourseDto.builder()
                .courseId(entity.getCourseId())
                .courseName(entity.getCourseName())
                .duration(entity.getDuration())
                .fees(entity.getFees())
                .description(entity.getDescription())
                .build();
    }

    private Course mapToEntity(CourseDto dto) {
        return Course.builder()
                .courseId(dto.getCourseId())
                .courseName(dto.getCourseName())
                .duration(dto.getDuration())
                .fees(dto.getFees())
                .description(dto.getDescription())
                .build();
    }

    @Override
    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        return mapToDto(course);
    }

    @Override
    @Transactional
    public CourseDto createCourse(CourseDto dto) {
        Course course = mapToEntity(dto);
        Course saved = courseRepository.save(course);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CourseDto updateCourse(Long id, CourseDto dto) {
        Course existing = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + id));
        existing.setCourseName(dto.getCourseName());
        existing.setDuration(dto.getDuration());
        existing.setFees(dto.getFees());
        existing.setDescription(dto.getDescription());
        Course updated = courseRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with ID: " + id);
        }
        courseRepository.deleteById(id);
    }
}
