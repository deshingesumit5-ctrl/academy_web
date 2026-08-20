package com.AcademyWeb.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleCreateEditDto {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    private String status; // Active / Inactive

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String confirmPassword;

    private String permissions; // JSON string
}
