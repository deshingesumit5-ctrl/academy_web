package com.AcademyWeb.repository;

import com.AcademyWeb.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    Optional<UserEntity> findByUsernameOrEmail(String username, String email);
    Optional<UserEntity> findFirstByRoleEntity_RoleId(Long roleId);
    List<UserEntity> findAllByRoleEntity_RoleId(Long roleId);
    boolean existsByEmail(String email);
    boolean existsByEmailAndUserIdNot(String email, Long userId);
}
