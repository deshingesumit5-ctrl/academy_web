package com.AcademyWeb.service.impl;

import com.AcademyWeb.config.JwtTokenUtil;
import com.AcademyWeb.dto.AuthRequestDto;
import com.AcademyWeb.dto.AuthResponseDto;
import com.AcademyWeb.entity.UserEntity;
import com.AcademyWeb.exception.BadRequestException;
import com.AcademyWeb.repository.UserRepository;
import com.AcademyWeb.service.AuthService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class AuthServiceImpl implements AuthService, UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new User(
                userEntity.getUsername(),
                userEntity.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userEntity.getRole()))
        );
    }

    @Override
    public AuthResponseDto login(AuthRequestDto authRequest) {
        String identifier = authRequest.getUsername();
        UserEntity userEntity = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!passwordEncoder.matches(authRequest.getPassword(), userEntity.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }

        String token = jwtTokenUtil.generateToken(userEntity.getUsername(), userEntity.getRole());

        return AuthResponseDto.builder()
                .token(token)
                .username(userEntity.getUsername())
                .fullName(userEntity.getFullName())
                .role(userEntity.getRole())
                .build();
    }

    @Override
    @PostConstruct
    public void seedDefaultAdminIfNotExist() {
        UserEntity admin = userRepository.findByUsername("admin@gmail.com")
                .or(() -> userRepository.findByEmail("admin@gmail.com"))
                .or(() -> userRepository.findByUsername("admin@academy.com"))
                .or(() -> userRepository.findByUsername("admin"))
                .orElseGet(() -> UserEntity.builder()
                        .fullName("Super Admin")
                        .role("SUPER_ADMIN")
                        .isActive(true)
                        .build()
                );

        admin.setUsername("admin@gmail.com");
        admin.setEmail("admin@gmail.com");
        admin.setPassword(passwordEncoder.encode("123456"));
        if (admin.getRole() == null) {
            admin.setRole("SUPER_ADMIN");
        }
        if (admin.getIsActive() == null) {
            admin.setIsActive(true);
        }
        userRepository.save(admin);
    }
}
