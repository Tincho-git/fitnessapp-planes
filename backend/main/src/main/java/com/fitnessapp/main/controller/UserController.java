package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.ChangeProfessorRequest;
import com.fitnessapp.main.entity.TrainingPlan;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/clients")
    @PreAuthorize("hasRole('PROFESOR')")
    public List<User> getClients(Authentication authentication) {
        return userService.getClientsByProfessorEmail(authentication.getName());
    }

    @PutMapping("/clients/profesor")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<Void> changeProfessor(@RequestBody ChangeProfessorRequest request, Authentication authentication) {
        userService.changeProfessor(authentication.getName(), request.getProfesorEmail());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/plans")
    public ResponseEntity<List<TrainingPlan>> getClientPlans(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(userService.getClientPlans(id, authentication.getName()));
    }

    @GetMapping("/admin/professors/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getPendingProfessors() {
        return userService.getPendingProfessors();
    }

    @PostMapping("/admin/professors/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveProfessor(@PathVariable Long id) {
        userService.setProfessorStatus(id, "ACTIVE");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/professors/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectProfessor(@PathVariable Long id) {
        userService.setProfessorStatus(id, "REJECTED");
        return ResponseEntity.ok().build();
    }
}
