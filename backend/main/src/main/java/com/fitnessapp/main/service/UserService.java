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

    public List<User> getClientsByProfessorEmail(String professorEmail) {
        User profesor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        return userRepository.findByProfesorId(profesor.getId());
    }

    public void changeProfessor(String clientEmail, String newProfessorEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        User newProfesor = userRepository.findByEmail(newProfessorEmail)
                .orElseThrow(() -> new RuntimeException("Nuevo Profesor no encontrado"));
        
        if (!"ADMIN".equals(newProfesor.getRole())) {
            throw new RuntimeException("El correo proporcionado no pertenece a un profesor");
        }
        
        client.setProfesor(newProfesor);
        userRepository.save(client);
    }

    public List<TrainingPlan> getClientPlans(Long clientId) {
        userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return trainingPlanRepository.findByUserId(clientId);
    }
}
