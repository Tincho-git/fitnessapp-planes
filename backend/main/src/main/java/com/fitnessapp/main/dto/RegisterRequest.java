package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre; 
    private String email;
    private String password;
    private String role;
    private String profesorEmail; // Solo para "CLIENT"
}
