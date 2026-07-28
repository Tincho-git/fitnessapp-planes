package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre; // We didn't ask for it in prompt, but entity requires it. We'll set a default if empty or ask in frontend.
    private String email;
    private String password;
    private String role;
    private String profesorEmail; // Solo para "CLIENT"
}
