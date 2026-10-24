package com.fitnessapp.main.dto;

import lombok.Data;

import java.util.List;

@Data
public class RoutineTemplateRequest {
    private String nombre;
    private String descripcion;
    private List<RoutineTemplateItemRequest> items;
}
