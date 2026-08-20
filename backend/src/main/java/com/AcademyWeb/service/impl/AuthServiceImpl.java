package com.AcademyWeb.service.impl;

import com.AcademyWeb.config.JwtTokenUtil;
import com.AcademyWeb.dto.AuthRequestDto;
import com.AcademyWeb.dto.AuthResponseDto;
import com.AcademyWeb.entity.UserEntity;
import com.AcademyWeb.exception.BadRequestException;
import com.AcademyWeb.repository.RoleRepository;
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

    @Autowired
    private RoleRepository roleRepository;

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

        Long roleId = null;
        String permissions = null;
        String roleName = userEntity.getRole();

        if (userEntity.getRoleEntity() != null) {
            roleId = userEntity.getRoleEntity().getRoleId();
            permissions = userEntity.getRoleEntity().getPermissions();
            roleName = userEntity.getRoleEntity().getName();
        } else if ("SUPER_ADMIN".equalsIgnoreCase(userEntity.getRole()) || "Super Admin".equalsIgnoreCase(userEntity.getRole())) {
            roleName = "Super Admin";
        }

        return AuthResponseDto.builder()
                .token(token)
                .username(userEntity.getUsername())
                .fullName(userEntity.getFullName())
                .role(roleName)
                .roleId(roleId)
                .permissions(permissions)
                .build();
    }

    @Override
    @PostConstruct
    public void seedDefaultAdminIfNotExist() {
        // Ensure Super Admin Role exists in DB
        com.AcademyWeb.entity.RoleEntity superAdminRole = roleRepository.findByName("Super Admin")
                .orElseGet(() -> {
                    com.AcademyWeb.entity.RoleEntity newRole = com.AcademyWeb.entity.RoleEntity.builder()
                            .name("Super Admin")
                            .description("Full administrative access to all modules and system settings.")
                            .status("Active")
                            .permissions("{\"Dashboard\":[\"Read\"],\"Academy Master\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Library Plan\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Course Master\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Batch Master\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Exam Master\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Inquiry Source\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Fee Structure\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Student Registration\":[\"Read\",\"Create\",\"Edit\",\"Delete\",\"Export\",\"Print\"],\"Attendance\":[\"Read\",\"Create\",\"Edit\"],\"Fee Management\":[\"Read\",\"Create\",\"Edit\",\"Approve\",\"Export\",\"Print\"],\"Marksheet\":[\"Read\",\"Create\",\"Edit\",\"Print\"],\"Inquiry\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Follow-ups\":[\"Read\",\"Create\",\"Edit\"],\"WhatsApp\":[\"Read\",\"Send\"],\"Tasks\":[\"Read\",\"Create\",\"Edit\",\"Delete\"],\"Reports\":[\"Read\",\"Export\"],\"User / Roles\":[\"Read\",\"Create\",\"Edit\",\"Delete\"]}")
                            .build();
                    return roleRepository.save(newRole);
                });

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
        admin.setRole("SUPER_ADMIN");
        admin.setIsActive(true);
        admin.setRoleEntity(superAdminRole);
        userRepository.save(admin);
    }
}
