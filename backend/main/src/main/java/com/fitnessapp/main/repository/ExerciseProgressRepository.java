package com.fitnessapp.main.repository;

import com.fitnessapp.main.entity.ExerciseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseProgressRepository extends JpaRepository<ExerciseProgress, Long> {
    List<ExerciseProgress> findByClientIdOrderByFechaDesc(Long clientId);
    List<ExerciseProgress> findByClientIdAndExerciseIdOrderByFechaAsc(Long clientId, Long exerciseId);
    List<ExerciseProgress> findByClientEmailOrderByFechaDesc(String email);
    List<ExerciseProgress> findByClientEmailAndExerciseIdOrderByFechaAsc(String email, Long exerciseId);
}
