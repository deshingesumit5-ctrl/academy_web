package com.AcademyWeb.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMasterDto {
    private Long userId;
    private Long employeeId;
    private String employeeName;
    private Long roleId;
    private String roleName;
    private String description;
    private String email;
    private String password;
    private String status;
}
