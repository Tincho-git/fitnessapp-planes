package com.fitnessapp.main.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "routine_template_items")
public class RoutineTemplateItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private RoutineTemplate template;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "dia")
    private String dia = "Día 1";

    private Integer sets;
    private Integer reps;

    @Column(name = "peso_sugerido")
    private Double pesoSugerido;

    @Column(name = "descanso_segundos")
    private Integer descansoSegundos = 90;

    @Column(name = "notas_extras")
    private String notasExtras;
}
