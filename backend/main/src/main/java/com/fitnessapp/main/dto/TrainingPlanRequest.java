package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class TrainingPlanRequest {
    private Long clientId;
    private Long exerciseId;
    private String dia;
    private Integer orden;
    private Integer sets;
    private Integer reps;
    private Double pesoSugerido;
    private Integer descansoSegundos;
    private String notasExtras;
}
