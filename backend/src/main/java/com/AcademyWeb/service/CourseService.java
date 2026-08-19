package com.AcademyWeb.service;

import com.AcademyWeb.dto.CourseDto;
import java.util.List;

public interface CourseService {
    List<CourseDto> getAllCourses();
    CourseDto getCourseById(Long id);
    CourseDto createCourse(CourseDto dto);
    CourseDto updateCourse(Long id, CourseDto dto);
    void deleteCourse(Long id);
}
