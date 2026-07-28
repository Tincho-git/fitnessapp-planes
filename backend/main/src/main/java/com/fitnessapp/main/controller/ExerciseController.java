package com.fitnessapp.main.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fitnessapp.main.entity.Exercise;
import com.fitnessapp.main.service.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final Cloudinary cloudinary;

    public ExerciseController(ExerciseService exerciseService, Cloudinary cloudinary) {
        this.exerciseService = exerciseService;
        this.cloudinary = cloudinary;
    }

    @GetMapping
    public List<Exercise> getAllExercises(Authentication authentication) {
        if (authentication != null && authentication.getName() != null) {
            return exerciseService.getExercisesByProfessorEmail(authentication.getName());
        }
        return exerciseService.getAllExercises();
    }

    @PostMapping
    public Exercise createExercise(@RequestBody Exercise exercise, Authentication authentication) {
        String email = authentication.getName();
        return exerciseService.createExerciseForProfessor(exercise, email);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
            String url = uploadResult.get("secure_url").toString();

            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al subir archivo: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateExercise(@PathVariable Long id, @RequestBody Exercise exercise, Authentication authentication) {
        try {
            String email = authentication.getName();
            Exercise updated = exerciseService.updateExerciseForProfessor(id, exercise, email);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExercise(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        exerciseService.deleteExerciseForProfessor(id, email);
        return ResponseEntity.noContent().build();
    }
}


