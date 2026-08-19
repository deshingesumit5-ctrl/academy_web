package com.AcademyWeb.service;

import com.AcademyWeb.dto.InquiryDto;
import java.util.List;

public interface InquiryService {
    List<InquiryDto> getAllInquiries();
    InquiryDto createInquiry(InquiryDto dto);
    InquiryDto updateInquiry(Long id, InquiryDto dto);
    void deleteInquiry(Long id);
}
