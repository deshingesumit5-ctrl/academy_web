package com.AcademyWeb.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodGroupDto {
    private Long bloodGroupId;
    private String name;
    private String status;
}
