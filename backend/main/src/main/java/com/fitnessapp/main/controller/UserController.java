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
    public List<User> getAllClients() {
        return userService.getAllClients();
    }

    @GetMapping("/{id}/plans")
    public ResponseEntity<List<TrainingPlan>> getClientPlans(@PathVariable Long id) {
        List<TrainingPlan> plans = userService.getClientPlans(id);
        return ResponseEntity.ok(plans);
    }
}
