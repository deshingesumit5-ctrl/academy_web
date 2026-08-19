package com.AcademyWeb.controller;

import com.AcademyWeb.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsAppController {

    @PostMapping("/send-bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendBulkMessage(@RequestBody Map<String, Object> payload) {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "SENT");
        result.put("message", "Bulk message sent successfully");
        return ResponseEntity.ok(ApiResponse.success("Message dispatched", result));
    }
}
