package com.fitnessapp.main.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "¡El backend de FitnessApp está funcionando correctamente! 🚀";
    }

    @GetMapping("/api/ping")
    public String ping() {
        return "pong";
    }
}
