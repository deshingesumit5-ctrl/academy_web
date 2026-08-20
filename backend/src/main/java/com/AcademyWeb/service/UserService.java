package com.AcademyWeb.service;

import com.AcademyWeb.dto.UserMasterDto;
import java.util.List;

public interface UserService {
    List<UserMasterDto> getAllUsers();
    UserMasterDto getUserById(Long id);
    UserMasterDto createUser(UserMasterDto dto);
    UserMasterDto updateUser(Long id, UserMasterDto dto);
    void deleteUser(Long id);
}
