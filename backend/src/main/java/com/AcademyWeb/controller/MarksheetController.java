package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import com.AcademyWeb.dto.MarksheetDto;
import com.AcademyWeb.service.MarksheetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marksheets")
public class MarksheetController {

    @Autowired
    private MarksheetService marksheetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarksheetDto>>> getAllMarksheets() {
        return ResponseEntity.ok(ApiResponse.success("Marksheets retrieved successfully", marksheetService.getAllMarksheets()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MarksheetDto>> saveMarksheet(@RequestBody MarksheetDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Marksheet record saved successfully", marksheetService.saveMarksheet(dto)));
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<MarksheetDto>>> saveBulkMarksheets(@RequestBody List<MarksheetDto> dtos) {
        return ResponseEntity.ok(ApiResponse.success("Bulk marksheets uploaded successfully", marksheetService.saveBulkMarksheets(dtos)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MarksheetDto>> updateMarksheet(@PathVariable Long id, @RequestBody MarksheetDto dto) {
        dto.setMarksheetId(id);
        return ResponseEntity.ok(ApiResponse.success("Marksheet record updated successfully", marksheetService.saveMarksheet(dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMarksheet(@PathVariable Long id) {
        marksheetService.deleteMarksheet(id);
        return ResponseEntity.ok(ApiResponse.success("Marksheet deleted successfully", null));
    }
}
