package com.fitnessapp.main.service;

import com.fitnessapp.main.dto.ExerciseProgressRequest;
import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.entity.ExerciseProgress;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.ExerciseProgressRepository;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExerciseProgressService {

    private final ExerciseProgressRepository exerciseProgressRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public ExerciseProgressService(ExerciseProgressRepository exerciseProgressRepository,
                                   UserRepository userRepository,
                                   ExerciseRepository exerciseRepository) {
        this.exerciseProgressRepository = exerciseProgressRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public ExerciseProgress logProgress(ExerciseProgressRequest request, String clientEmail) {
        User client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));

        ExerciseProgress progress = new ExerciseProgress();
        progress.setClient(client);
        progress.setExercise(exercise);
        progress.setPesoUsado(request.getPesoUsado());
        progress.setRepsRealizadas(request.getRepsRealizadas());
        progress.setSetsRealizados(request.getSetsRealizados());
        progress.setNotas(request.getNotas());
        progress.setFecha(LocalDateTime.now());

        return exerciseProgressRepository.save(progress);
    }

    public List<ExerciseProgress> getMyProgress(String clientEmail) {
        return exerciseProgressRepository.findByClientEmailOrderByFechaDesc(clientEmail);
    }

    public List<ExerciseProgress> getMyProgressByExercise(String clientEmail, Long exerciseId) {
        return exerciseProgressRepository.findByClientEmailAndExerciseIdOrderByFechaAsc(clientEmail, exerciseId);
    }

    public List<ExerciseProgress> getClientProgress(Long clientId, String profesorEmail) {
        verifyClientBelongsToProfesor(clientId, profesorEmail);
        return exerciseProgressRepository.findByClientIdOrderByFechaDesc(clientId);
    }

    public List<ExerciseProgress> getClientProgressByExercise(Long clientId, Long exerciseId, String profesorEmail) {
        verifyClientBelongsToProfesor(clientId, profesorEmail);
        return exerciseProgressRepository.findByClientIdAndExerciseIdOrderByFechaAsc(clientId, exerciseId);
    }

    private void verifyClientBelongsToProfesor(Long clientId, String profesorEmail) {
        User profesor = userRepository.findByEmail(profesorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        // Solo puede acceder el profesor asignado al cliente.
        if (client.getProfesor() != null && client.getProfesor().getId().equals(profesor.getId())) {
            return;
        }
        throw new RuntimeException("No tiene permisos para ver el progreso de este cliente");
    }
}
