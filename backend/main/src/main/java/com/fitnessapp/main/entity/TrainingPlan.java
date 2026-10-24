package com.fitnessapp.main.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "training_plans")
public class TrainingPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "dia")
    private String dia = "Día 1";

    @Column(name = "orden")
    private Integer orden = 1;

    private Integer sets;
    private Integer reps;

    @Column(name = "peso_sugerido")
    private Double pesoSugerido;

    @Column(name = "descanso_segundos")
    private Integer descansoSegundos = 90;

    @Column(name = "notas_extras")
    private String notasExtras;
}
