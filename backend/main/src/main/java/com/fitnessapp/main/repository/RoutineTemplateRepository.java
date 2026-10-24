package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.RoutineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineTemplateRepository extends JpaRepository<RoutineTemplate, Long> {
    List<RoutineTemplate> findByProfesorEmail(String email);
    Optional<RoutineTemplate> findByIdAndProfesorEmail(Long id, String email);
}
