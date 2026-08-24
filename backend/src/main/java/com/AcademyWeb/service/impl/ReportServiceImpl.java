package com.AcademyWeb.service.impl;

import com.AcademyWeb.entity.Student;
import com.AcademyWeb.repository.*;
import com.AcademyWeb.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FeePaymentRepository feePaymentRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Map<String, Object> getReportsSummary() {
        Map<String, Object> reports = new HashMap<>();
        reports.put("totalStudents", studentRepository.count());
        reports.put("totalPayments", feePaymentRepository.count());
        reports.put("totalInquiries", inquiryRepository.count());
        reports.put("totalTasks", taskRepository.count());
        return reports;
    }

    @Override
    public List<Map<String, Object>> getStudentGrowthReport() {
        List<Student> students = studentRepository.findAllByOrderByStudentIdDesc();
        List<Map<String, Object>> reportList = new ArrayList<>();

        for (Student s : students) {
            Map<String, Object> item = new HashMap<>();
            item.put("studentId", s.getStudentId());
            item.put("rollNumber", s.getRollNumber() != null ? s.getRollNumber() : "-");
            item.put("studentName", s.getStudentName());
            item.put("batchName", s.getBatch() != null ? s.getBatch().getBatchName() : "-");
            item.put("courseName", s.getCourse() != null ? s.getCourse().getCourseName() : "-");
            
            double prevExamMarks = s.getExamMarks() != null ? s.getExamMarks() : 0.0;
            double physicalMarks = s.getPhysicalMarks() != null ? s.getPhysicalMarks() : 0.0;
            double writtenMarks = s.getWrittenMarks() != null ? s.getWrittenMarks() : 0.0;
            double currentTotal = physicalMarks + writtenMarks;
            
            double growth = currentTotal - prevExamMarks;
            double growthPercent = prevExamMarks > 0 ? (growth / prevExamMarks) * 100.0 : (currentTotal > 0 ? 100.0 : 0.0);

            item.put("previousMarks", prevExamMarks);
            item.put("physicalMarks", physicalMarks);
            item.put("writtenMarks", writtenMarks);
            item.put("currentTotalMarks", currentTotal);
            item.put("improvement", growth);
            item.put("growthPercent", Math.round(growthPercent * 100.0) / 100.0);
            item.put("trend", growth >= 0 ? "POSITIVE" : "NEGATIVE");

            reportList.add(item);
        }

        return reportList;
    }
}
