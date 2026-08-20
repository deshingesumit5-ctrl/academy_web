package com.AcademyWeb.service.impl;

import com.AcademyWeb.dto.StudentDto;
import com.AcademyWeb.entity.Batch;
import com.AcademyWeb.entity.Course;
import com.AcademyWeb.entity.LibraryPlan;
import com.AcademyWeb.entity.Student;
import com.AcademyWeb.exception.ResourceNotFoundException;
import com.AcademyWeb.repository.BatchRepository;
import com.AcademyWeb.repository.CourseRepository;
import com.AcademyWeb.repository.LibraryPlanRepository;
import com.AcademyWeb.repository.StudentRepository;
import com.AcademyWeb.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LibraryPlanRepository libraryPlanRepository;

    @Autowired
    private BatchRepository batchRepository;

    private StudentDto mapToDto(Student entity) {
        return StudentDto.builder()
                .studentId(entity.getStudentId())
                .admissionNumber(entity.getAdmissionNumber())
                .studentName(entity.getStudentName())
                .gender(entity.getGender())
                .dob(entity.getDob())
                .mobileNumber(entity.getMobileNumber())
                .email(entity.getEmail())
                .address(entity.getAddress())
                .aadhaarNumber(entity.getAadhaarNumber())
                .photo(entity.getPhotoUrl())
                .photoUrl(entity.getPhotoUrl())
                .fatherName(entity.getFatherName())
                .motherName(entity.getMotherName())
                .parentMobile(entity.getParentMobile())
                .parentEmail(entity.getParentEmail())
                .schoolCollege(entity.getSchoolCollege())
                .qualification(entity.getQualification())
                .currentStandard(entity.getCurrentStandard())
                .admissionType(entity.getAdmissionType())
                .courseId(entity.getCourse() != null ? entity.getCourse().getCourseId() : null)
                .courseName(entity.getCourse() != null ? entity.getCourse().getCourseName() : null)
                .planId(entity.getLibraryPlan() != null ? entity.getLibraryPlan().getPlanId() : null)
                .planName(entity.getLibraryPlan() != null ? entity.getLibraryPlan().getPlanName() : null)
                .batchId(entity.getBatch() != null ? entity.getBatch().getBatchId() : null)
                .batchName(entity.getBatch() != null ? entity.getBatch().getBatchName() : null)
                .admissionDate(entity.getAdmissionDate())
                .status(entity.getStatus())
                .build();
    }

    @Override
    public List<StudentDto> getAllStudents() {
        return studentRepository.findAllByOrderByStudentIdDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return mapToDto(student);
    }

    @Override
    public StudentDto registerStudent(StudentDto dto) {
        Course course = dto.getCourseId() != null ? courseRepository.findById(dto.getCourseId()).orElse(null) : null;
        LibraryPlan libraryPlan = dto.getPlanId() != null ? libraryPlanRepository.findById(dto.getPlanId()).orElse(null)
                : null;
        Batch batch = dto.getBatchId() != null ? batchRepository.findById(dto.getBatchId()).orElse(null) : null;

        String admissionNo = "ADM" + (1000 + (int) (Math.random() * 9000));
        String photoVal = dto.getPhoto() != null ? dto.getPhoto() : dto.getPhotoUrl();

        Student student = Student.builder()
                .admissionNumber(admissionNo)
                .studentName(dto.getStudentName())
                .gender(dto.getGender())
                .dob(dto.getDob())
                .mobileNumber(dto.getMobileNumber())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .aadhaarNumber(dto.getAadhaarNumber())
                .fatherName(dto.getFatherName())
                .motherName(dto.getMotherName())
                .parentMobile(dto.getParentMobile())
                .parentEmail(dto.getParentEmail())
                .schoolCollege(dto.getSchoolCollege())
                .qualification(dto.getQualification())
                .currentStandard(dto.getCurrentStandard())
                .admissionType(dto.getAdmissionType())
                .course(course)
                .libraryPlan(libraryPlan)
                .batch(batch)
                .admissionDate(dto.getAdmissionDate() != null ? dto.getAdmissionDate() : java.time.LocalDate.now())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        Student saved = studentRepository.save(student);
        return mapToDto(saved);
    }

    @Override
    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        existing.setStudentName(dto.getStudentName());
        existing.setGender(dto.getGender());
        existing.setDob(dto.getDob());
        existing.setMobileNumber(dto.getMobileNumber());
        existing.setEmail(dto.getEmail());
        existing.setAddress(dto.getAddress());
        existing.setAadhaarNumber(dto.getAadhaarNumber());

        String photoVal = dto.getPhoto() != null ? dto.getPhoto() : dto.getPhotoUrl();
        if (photoVal != null) {
            existing.setPhotoUrl(photoVal);
        }

        existing.setFatherName(dto.getFatherName());
        existing.setMotherName(dto.getMotherName());
        existing.setParentMobile(dto.getParentMobile());
        existing.setParentEmail(dto.getParentEmail());
        existing.setSchoolCollege(dto.getSchoolCollege());
        existing.setQualification(dto.getQualification());
        existing.setCurrentStandard(dto.getCurrentStandard());
        existing.setAdmissionType(dto.getAdmissionType());
        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        if (dto.getCourseId() != null) {
            existing.setCourse(courseRepository.findById(dto.getCourseId()).orElse(null));
        }
        if (dto.getPlanId() != null) {
            existing.setLibraryPlan(libraryPlanRepository.findById(dto.getPlanId()).orElse(null));
        }
        if (dto.getBatchId() != null) {
            existing.setBatch(batchRepository.findById(dto.getBatchId()).orElse(null));
        }

        Student updated = studentRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
    }
}
