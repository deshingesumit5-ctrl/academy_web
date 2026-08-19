package com.AcademyWeb.service;

import com.AcademyWeb.dto.InquirySourceDto;
import java.util.List;

public interface InquirySourceService {
    List<InquirySourceDto> getAllInquirySources();
    InquirySourceDto getInquirySourceById(Long id);
    InquirySourceDto createInquirySource(InquirySourceDto dto);
    InquirySourceDto updateInquirySource(Long id, InquirySourceDto dto);
    void deleteInquirySource(Long id);
}
