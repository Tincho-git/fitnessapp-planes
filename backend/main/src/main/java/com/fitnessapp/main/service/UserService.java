package com.fitnessapp.main.service;

import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final TrainingPlanRepository trainingPlanRepository;

    public UserService(UserRepository userRepository, TrainingPlanRepository trainingPlanRepository) {
        this.userRepository = userRepository;
        this.trainingPlanRepository = trainingPlanRepository;
    }

    public List<User> getAllClients() {
        return userRepository.findByRole("CLIENT");
    }

    public List<TrainingPlan> getClientPlans(Long clientId) {
        userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return trainingPlanRepository.findByUserId(clientId);
    }
}
