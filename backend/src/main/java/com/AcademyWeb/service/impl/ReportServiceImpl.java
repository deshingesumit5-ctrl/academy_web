package com.AcademyWeb.service.impl;

import com.AcademyWeb.repository.*;
import com.AcademyWeb.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

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
}
