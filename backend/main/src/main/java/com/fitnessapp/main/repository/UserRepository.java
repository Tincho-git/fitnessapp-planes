package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(String role);
    Optional<User> findByEmail(String email);
    List<User> findByProfesorId(Long profesorId);
}
