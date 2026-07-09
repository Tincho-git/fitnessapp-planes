package com.fitnessapp.main.controller;

import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/clients")
    public List<User> getClients(org.springframework.security.core.Authentication authentication) {
        String professorEmail = authentication.getName();
        return userService.getClientsByProfessorEmail(professorEmail);
    }

    @PutMapping("/clients/profesor")
    public ResponseEntity<?> changeProfessor(@RequestBody com.fitnessapp.main.dto.ChangeProfessorRequest request, org.springframework.security.core.Authentication authentication) {
        String clientEmail = authentication.getName();
        userService.changeProfessor(clientEmail, request.getProfesorEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/plans")
    public ResponseEntity<List<TrainingPlan>> getClientPlans(@PathVariable Long id) {
        List<TrainingPlan> plans = userService.getClientPlans(id);
        return ResponseEntity.ok(plans);
    }
}
