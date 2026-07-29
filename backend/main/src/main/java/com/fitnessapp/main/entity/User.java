package com.fitnessapp.main.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role = "CLIENT"; // ADMIN, PROFESOR o CLIENT

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE"; // PENDING, ACTIVE o REJECTED

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profesor_id")
    private User profesor;
}
