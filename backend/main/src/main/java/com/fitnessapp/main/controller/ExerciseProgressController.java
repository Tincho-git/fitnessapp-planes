package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.ExerciseProgressRequest;
import com.fitnessapp.main.entity.ExerciseProgress;
import com.fitnessapp.main.service.ExerciseProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ExerciseProgressController {

    private final ExerciseProgressService exerciseProgressService;

    public ExerciseProgressController(ExerciseProgressService exerciseProgressService) {
        this.exerciseProgressService = exerciseProgressService;
    }

    @PostMapping
    public ResponseEntity<ExerciseProgress> logProgress(@RequestBody ExerciseProgressRequest request, Authentication authentication) {
        String clientEmail = authentication.getName();
        ExerciseProgress saved = exerciseProgressService.logProgress(request, clientEmail);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ExerciseProgress>> getMyProgress(Authentication authentication) {
        String clientEmail = authentication.getName();
        return ResponseEntity.ok(exerciseProgressService.getMyProgress(clientEmail));
    }

    @GetMapping("/mine/{exerciseId}")
    public ResponseEntity<List<ExerciseProgress>> getMyProgressByExercise(@PathVariable Long exerciseId, Authentication authentication) {
        String clientEmail = authentication.getName();
        return ResponseEntity.ok(exerciseProgressService.getMyProgressByExercise(clientEmail, exerciseId));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ExerciseProgress>> getClientProgress(@PathVariable Long clientId, Authentication authentication) {
        String profesorEmail = authentication.getName();
        return ResponseEntity.ok(exerciseProgressService.getClientProgress(clientId, profesorEmail));
    }

    @GetMapping("/client/{clientId}/exercise/{exerciseId}")
    public ResponseEntity<List<ExerciseProgress>> getClientProgressByExercise(@PathVariable Long clientId, @PathVariable Long exerciseId, Authentication authentication) {
        String profesorEmail = authentication.getName();
        return ResponseEntity.ok(exerciseProgressService.getClientProgressByExercise(clientId, exerciseId, profesorEmail));
    }
}
