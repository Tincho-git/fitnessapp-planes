package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class ExerciseProgressRequest {
    private Long exerciseId;
    private double pesoUsado;
    private int repsRealizadas;
    private int setsRealizados;
    private String notas;
}
