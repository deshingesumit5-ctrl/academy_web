package com.AcademyWeb.service;

import java.util.List;
import java.util.Map;

public interface ReportService {
    Map<String, Object> getReportsSummary();
    List<Map<String, Object>> getStudentGrowthReport();
}
