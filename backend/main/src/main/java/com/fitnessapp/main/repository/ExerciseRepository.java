package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByCreatedByEmail(String email);
    Optional<Exercise> findByIdAndCreatedByEmail(Long id, String email);
}
