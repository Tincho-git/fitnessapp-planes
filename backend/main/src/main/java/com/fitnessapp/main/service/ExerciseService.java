package com.fitnessapp.main.service;

import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.repository.ExerciseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
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
            return exerciseRepository.save(exercise);
        }).orElseThrow(() -> new RuntimeException("Exercise no encontrado"));
    }

    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }
}
