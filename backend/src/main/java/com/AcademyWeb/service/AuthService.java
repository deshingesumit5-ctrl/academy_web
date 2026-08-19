package com.AcademyWeb.service;

import com.AcademyWeb.dto.AuthRequestDto;
import com.AcademyWeb.dto.AuthResponseDto;

public interface AuthService {
    AuthResponseDto login(AuthRequestDto authRequest);
    void seedDefaultAdminIfNotExist();
}
