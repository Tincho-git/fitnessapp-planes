package com.fitnessapp.main.service;

import com.fitnessapp.main.dto.ApplyTemplateRequest;
import com.fitnessapp.main.dto.RoutineTemplateItemRequest;
import com.fitnessapp.main.dto.RoutineTemplateRequest;
import com.fitnessapp.main.entity.*;
import com.fitnessapp.main.repository.ExerciseRepository;
import com.fitnessapp.main.repository.RoutineTemplateRepository;
import com.fitnessapp.main.repository.TrainingPlanRepository;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoutineTemplateService {
    private final RoutineTemplateRepository routineTemplateRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;
    private final TrainingPlanRepository trainingPlanRepository;

    public RoutineTemplateService(RoutineTemplateRepository routineTemplateRepository,
                                  ExerciseRepository exerciseRepository,
                                  UserRepository userRepository,
                                  TrainingPlanRepository trainingPlanRepository) {
        this.routineTemplateRepository = routineTemplateRepository;
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
        this.trainingPlanRepository = trainingPlanRepository;
    }

    public List<RoutineTemplate> getTemplatesByProfessor(String professorEmail) {
        return routineTemplateRepository.findByProfesorEmail(professorEmail);
    }

    @Transactional
    public RoutineTemplate createTemplate(RoutineTemplateRequest request, String professorEmail) {
        User profesor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        RoutineTemplate template = new RoutineTemplate();
        template.setNombre(request.getNombre());
        template.setDescripcion(request.getDescripcion());
        template.setProfesor(profesor);

        if (request.getItems() != null) {
            for (RoutineTemplateItemRequest itemReq : request.getItems()) {
                Exercise ex = exerciseRepository.findById(itemReq.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));
                RoutineTemplateItem item = new RoutineTemplateItem();
                item.setTemplate(template);
                item.setExercise(ex);
                item.setDia(itemReq.getDia() != null && !itemReq.getDia().trim().isEmpty() ? itemReq.getDia().trim() : "Día 1");
                item.setSets(itemReq.getSets() != null ? itemReq.getSets() : 3);
                item.setReps(itemReq.getReps() != null ? itemReq.getReps() : 10);
                item.setPesoSugerido(itemReq.getPesoSugerido());
                item.setDescansoSegundos(itemReq.getDescansoSegundos() != null ? itemReq.getDescansoSegundos() : 90);
                item.setNotasExtras(itemReq.getNotasExtras());
                template.getItems().add(item);
            }
        }

        return routineTemplateRepository.save(template);
    }

    @Transactional
    public RoutineTemplate updateTemplate(Long id, RoutineTemplateRequest request, String professorEmail) {
        RoutineTemplate template = routineTemplateRepository.findByIdAndProfesorEmail(id, professorEmail)
                .orElseThrow(() -> new AccessDeniedException("Plantilla no encontrada o sin permisos"));

        if (request.getNombre() != null && !request.getNombre().trim().isEmpty()) {
            template.setNombre(request.getNombre().trim());
        }
        template.setDescripcion(request.getDescripcion());

        if (request.getItems() != null) {
            template.getItems().clear();
            for (RoutineTemplateItemRequest itemReq : request.getItems()) {
                Exercise ex = exerciseRepository.findById(itemReq.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Ejercicio no encontrado"));
                RoutineTemplateItem item = new RoutineTemplateItem();
                item.setTemplate(template);
                item.setExercise(ex);
                item.setDia(itemReq.getDia() != null && !itemReq.getDia().trim().isEmpty() ? itemReq.getDia().trim() : "Día 1");
                item.setSets(itemReq.getSets() != null ? itemReq.getSets() : 3);
                item.setReps(itemReq.getReps() != null ? itemReq.getReps() : 10);
                item.setPesoSugerido(itemReq.getPesoSugerido());
                item.setDescansoSegundos(itemReq.getDescansoSegundos() != null ? itemReq.getDescansoSegundos() : 90);
                item.setNotasExtras(itemReq.getNotasExtras());
                template.getItems().add(item);
            }
        }

        return routineTemplateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(Long id, String professorEmail) {
        RoutineTemplate template = routineTemplateRepository.findByIdAndProfesorEmail(id, professorEmail)
                .orElseThrow(() -> new AccessDeniedException("Plantilla no encontrada o sin permisos"));
        routineTemplateRepository.delete(template);
    }

    @Transactional
    public RoutineTemplate createTemplateFromClientPlan(Long clientId, RoutineTemplateRequest request, String professorEmail) {
        User profesor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (client.getProfesor() == null || !client.getProfesor().getId().equals(profesor.getId())) {
            throw new AccessDeniedException("No tiene permisos sobre este cliente");
        }

        List<TrainingPlan> clientPlans = trainingPlanRepository.findByUserId(clientId);
        if (clientPlans.isEmpty()) {
            throw new RuntimeException("El cliente no tiene ejercicios en su rutina para guardar como plantilla");
        }

        RoutineTemplate template = new RoutineTemplate();
        template.setNombre(request.getNombre() != null && !request.getNombre().trim().isEmpty()
                ? request.getNombre().trim()
                : "Rutina de " + client.getNombre());
        template.setDescripcion(request.getDescripcion());
        template.setProfesor(profesor);

        for (TrainingPlan plan : clientPlans) {
            RoutineTemplateItem item = new RoutineTemplateItem();
            item.setTemplate(template);
            item.setExercise(plan.getExercise());
            item.setDia(plan.getDia() != null ? plan.getDia() : "Día 1");
            item.setSets(plan.getSets());
            item.setReps(plan.getReps());
            item.setPesoSugerido(plan.getPesoSugerido());
            item.setDescansoSegundos(plan.getDescansoSegundos() != null ? plan.getDescansoSegundos() : 90);
            item.setNotasExtras(plan.getNotasExtras());
            template.getItems().add(item);
        }

        return routineTemplateRepository.save(template);
    }

    @Transactional
    public List<TrainingPlan> applyTemplateToClient(Long templateId, ApplyTemplateRequest request, String professorEmail) {
        User profesor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        User client = userRepository.findById(request.getClientId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (client.getProfesor() == null || !client.getProfesor().getId().equals(profesor.getId())) {
            throw new AccessDeniedException("No tiene permisos para modificar el plan de este cliente");
        }

        RoutineTemplate template = routineTemplateRepository.findByIdAndProfesorEmail(templateId, professorEmail)
                .orElseThrow(() -> new AccessDeniedException("Plantilla no encontrada o sin permisos"));

        if (Boolean.TRUE.equals(request.getReplaceExisting())) {
            trainingPlanRepository.deleteByUserId(client.getId());
        }

        List<TrainingPlan> created = new ArrayList<>();
        int orden = 1;
        for (RoutineTemplateItem item : template.getItems()) {
            TrainingPlan plan = new TrainingPlan();
            plan.setUser(client);
            plan.setExercise(item.getExercise());
            plan.setDia(item.getDia() != null ? item.getDia() : "Día 1");
            plan.setOrden(orden++);
            plan.setSets(item.getSets());
            plan.setReps(item.getReps());
            plan.setPesoSugerido(item.getPesoSugerido());
            plan.setDescansoSegundos(item.getDescansoSegundos() != null ? item.getDescansoSegundos() : 90);
            plan.setNotasExtras(item.getNotasExtras());
            created.add(trainingPlanRepository.save(plan));
        }

        return created;
    }
}
