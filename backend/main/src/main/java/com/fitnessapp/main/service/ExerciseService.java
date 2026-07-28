package com.fitnessapp.main.service;

import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.ExerciseProgressRepository;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final TrainingPlanRepository trainingPlanRepository;
    private final ExerciseProgressRepository exerciseProgressRepository;
    private final UserRepository userRepository;

    public ExerciseService(ExerciseRepository exerciseRepository,
                           TrainingPlanRepository trainingPlanRepository,
                           ExerciseProgressRepository exerciseProgressRepository,
                           UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.trainingPlanRepository = trainingPlanRepository;
        this.exerciseProgressRepository = exerciseProgressRepository;
        this.userRepository = userRepository;
    }

    public List<Exercise> getExercisesByProfessorEmail(String email) {
        return exerciseRepository.findByCreatedByEmail(email);
    }

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    public Exercise createExerciseForProfessor(Exercise exercise, String email) {
        User profesor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        exercise.setCreatedBy(profesor);
        return exerciseRepository.save(exercise);
    }

    public Exercise updateExerciseForProfessor(Long id, Exercise exerciseDetails, String email) {
        Exercise exercise = exerciseRepository.findByIdAndCreatedByEmail(id, email)
                .orElseGet(() -> exerciseRepository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado")));

        exercise.setNombre(exerciseDetails.getNombre());
        exercise.setMusculo(exerciseDetails.getMusculo());
        exercise.setDescripcion(exerciseDetails.getDescripcion());
        if (exerciseDetails.getImagenUrl() != null) {
            exercise.setImagenUrl(exerciseDetails.getImagenUrl());
        }
        if (exerciseDetails.getVideoUrl() != null) {
            exercise.setVideoUrl(exerciseDetails.getVideoUrl());
        }
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void deleteExerciseForProfessor(Long id, String email) {
        trainingPlanRepository.deleteByExerciseId(id);
        exerciseProgressRepository.deleteByExerciseId(id);
        exerciseRepository.deleteById(id);
    }
}


