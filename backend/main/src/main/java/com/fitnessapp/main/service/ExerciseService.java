package com.fitnessapp.main.service;

import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.repository.ExerciseProgressRepository;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;
    private final TrainingPlanRepository trainingPlanRepository;
    private final ExerciseProgressRepository exerciseProgressRepository;

    public ExerciseService(ExerciseRepository exerciseRepository,
                           TrainingPlanRepository trainingPlanRepository,
                           ExerciseProgressRepository exerciseProgressRepository) {
        this.exerciseRepository = exerciseRepository;
        this.trainingPlanRepository = trainingPlanRepository;
        this.exerciseProgressRepository = exerciseProgressRepository;
    }

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Optional<Exercise> getExerciseById(Long id) {
        return exerciseRepository.findById(id);
    }

    public Exercise createExercise(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    public Exercise updateExercise(Long id, Exercise exerciseDetails) {
        return exerciseRepository.findById(id).map(exercise -> {
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
        }).orElseThrow(() -> new RuntimeException("Exercise no encontrado"));
    }

    @Transactional
    public void deleteExercise(Long id) {
        trainingPlanRepository.deleteByExerciseId(id);
        exerciseProgressRepository.deleteByExerciseId(id);
        exerciseRepository.deleteById(id);
    }
}

