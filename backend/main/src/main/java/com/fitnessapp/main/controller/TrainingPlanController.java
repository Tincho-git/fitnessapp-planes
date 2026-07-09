package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.TrainingPlanRequest;
import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.service.TrainingPlanService;
import com.fitnessapp.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TrainingPlanController {

    private final TrainingPlanService trainingPlanService;
    private final UserService userService;

    public TrainingPlanController(TrainingPlanService trainingPlanService, UserService userService) {
        this.trainingPlanService = trainingPlanService;
        this.userService = userService;
    }

    // Endpoint que usa AssignPlanForm: /api/users/clients/{id}/plan
    @GetMapping("/users/clients/{id}/plan")
    public ResponseEntity<List<TrainingPlan>> getClientPlan(@PathVariable Long id) {
        List<TrainingPlan> plans = userService.getClientPlans(id);
        return ResponseEntity.ok(plans);
    }

    // Crear nueva entrada en el plan de un cliente
    @PostMapping("/training-plans")
    public ResponseEntity<TrainingPlan> createPlan(@RequestBody TrainingPlanRequest request) {
        TrainingPlan created = trainingPlanService.createTrainingPlan(request);
        return ResponseEntity.ok(created);
    }

    // Eliminar una entrada del plan
    @DeleteMapping("/training-plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        trainingPlanService.deleteTrainingPlan(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para el cliente: ver su propio plan
    @GetMapping("/my-plan")
    public ResponseEntity<List<TrainingPlan>> getMyPlan(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        List<TrainingPlan> plans = trainingPlanService.getMyPlanByEmail(email);
        return ResponseEntity.ok(plans);
    }
}
