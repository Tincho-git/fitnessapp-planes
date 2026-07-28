package com.fitnessapp.main.service;

import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

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
        
        if (!"PROFESOR".equals(newProfesor.getRole()) || !"ACTIVE".equals(newProfesor.getStatus())) {
            throw new RuntimeException("El correo proporcionado no pertenece a un profesor");
        }
        
        client.setProfesor(newProfesor);
        userRepository.save(client);
    }

    public List<TrainingPlan> getClientPlans(Long clientId, String requesterEmail) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isOwner = client.getEmail().equals(requester.getEmail());
        boolean isAssignedProfessor = client.getProfesor() != null
                && client.getProfesor().getId().equals(requester.getId());
        if (!isOwner && !isAssignedProfessor) {
            throw new AccessDeniedException("No tiene permisos para ver este plan");
        }
        return trainingPlanRepository.findByUserId(clientId);
    }

    public List<User> getPendingProfessors() {
        return userRepository.findByRoleAndStatus("PROFESOR", "PENDING");
    }

    public void setProfessorStatus(Long professorId, String status) {
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        if (!"PROFESOR".equals(professor.getRole())) {
            throw new RuntimeException("El usuario indicado no es profesor");
        }
        professor.setStatus(status);
        userRepository.save(professor);
    }
}
