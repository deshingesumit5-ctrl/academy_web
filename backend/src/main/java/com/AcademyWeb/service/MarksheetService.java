package com.AcademyWeb.service;

import com.AcademyWeb.dto.MarksheetDto;
import java.util.List;

public interface MarksheetService {
    List<MarksheetDto> getAllMarksheets();
    MarksheetDto saveMarksheet(MarksheetDto dto);
    List<MarksheetDto> saveBulkMarksheets(List<MarksheetDto> dtos);
    void deleteMarksheet(Long id);
}
