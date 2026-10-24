package com.fitnessapp.main.dto;

import lombok.Data;

@Data
public class RoutineTemplateItemRequest {
    private Long exerciseId;
    private String dia;
    private Integer sets;
    private Integer reps;
    private Double pesoSugerido;
    private Integer descansoSegundos;
    private String notasExtras;
}
