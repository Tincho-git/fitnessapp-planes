package com.fitnessapp.main.service;

import com.fitnessapp.main.dto.TrainingPlanRequest;
import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainingPlanService {
    private final TrainingPlanRepository trainingPlanRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public TrainingPlanService(TrainingPlanRepository trainingPlanRepository, 
                               UserRepository userRepository, 
                               ExerciseRepository exerciseRepository) {
        this.trainingPlanRepository = trainingPlanRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public TrainingPlan createTrainingPlan(TrainingPlanRequest request) {
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
                
        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        TrainingPlan plan = new TrainingPlan();
        plan.setUser(client);
        plan.setExercise(exercise);
        plan.setSets(request.getSets());
        plan.setReps(request.getReps());
        plan.setPesoSugerido(request.getPesoSugerido());
        plan.setNotasExtras(request.getNotasExtras());

        return trainingPlanRepository.save(plan);
    }

    public void deleteTrainingPlan(Long id) {
        trainingPlanRepository.deleteById(id);
    }

    public List<TrainingPlan> getMyPlanByEmail(String email) {
        return trainingPlanRepository.findByUserEmail(email);
    }
}
