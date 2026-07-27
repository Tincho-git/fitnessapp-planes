package com.fitnessapp.main.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exercise_progress")
public class ExerciseProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private double pesoUsado;

    @Column(nullable = false)
    private int repsRealizadas;

    @Column(nullable = false)
    private int setsRealizados;

    private String notas;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
}
