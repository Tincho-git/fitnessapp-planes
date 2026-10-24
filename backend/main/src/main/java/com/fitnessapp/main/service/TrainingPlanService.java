package com.fitnessapp.main.service;

import com.fitnessapp.main.dto.TrainingPlanRequest;
import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

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

    public TrainingPlan createTrainingPlan(TrainingPlanRequest request, String professorEmail) {
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        verifyProfessorOwnsClient(client, professorEmail);

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        TrainingPlan plan = new TrainingPlan();
        plan.setUser(client);
        plan.setExercise(exercise);
        plan.setDia(request.getDia() != null && !request.getDia().trim().isEmpty() ? request.getDia().trim() : "Día 1");
        plan.setOrden(request.getOrden() != null ? request.getOrden() : 1);
        plan.setSets(request.getSets());
        plan.setReps(request.getReps());
        plan.setPesoSugerido(request.getPesoSugerido());
        plan.setDescansoSegundos(request.getDescansoSegundos() != null ? request.getDescansoSegundos() : 90);
        plan.setNotasExtras(request.getNotasExtras());

        return trainingPlanRepository.save(plan);
    }

    public TrainingPlan updateTrainingPlan(Long id, TrainingPlanRequest request, String professorEmail) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        verifyProfessorOwnsClient(plan.getUser(), professorEmail);

        if (request.getExerciseId() != null) {
            Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));
            plan.setExercise(exercise);
        }
        if (request.getDia() != null && !request.getDia().trim().isEmpty()) {
            plan.setDia(request.getDia().trim());
        }
        if (request.getOrden() != null) {
            plan.setOrden(request.getOrden());
        }
        if (request.getSets() != null) {
            plan.setSets(request.getSets());
        }
        if (request.getReps() != null) {
            plan.setReps(request.getReps());
        }
        plan.setPesoSugerido(request.getPesoSugerido());
        if (request.getDescansoSegundos() != null) {
            plan.setDescansoSegundos(request.getDescansoSegundos());
        }
        plan.setNotasExtras(request.getNotasExtras());

        return trainingPlanRepository.save(plan);
    }

    public void deleteTrainingPlan(Long id, String professorEmail) {
        TrainingPlan plan = trainingPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan no encontrado"));
        verifyProfessorOwnsClient(plan.getUser(), professorEmail);
        trainingPlanRepository.delete(plan);
    }

    public List<TrainingPlan> getMyPlanByEmail(String email) {
        return trainingPlanRepository.findByUserEmail(email);
    }

    private void verifyProfessorOwnsClient(User client, String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        if (client.getProfesor() == null || !client.getProfesor().getId().equals(professor.getId())) {
            throw new AccessDeniedException("No tiene permisos para modificar el plan de este cliente");
        }
    }
}
