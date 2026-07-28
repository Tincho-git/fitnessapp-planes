package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.JwtAuthResponse;
import com.fitnessapp.main.dto.LoginRequest;
import com.fitnessapp.main.dto.RegisterRequest;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import com.fitnessapp.main.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                          UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return ResponseEntity.ok(new JwtAuthResponse(tokenProvider.generateToken(authentication)));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El email ya está en uso.");
        }
        if (!"CLIENT".equals(request.getRole()) && !"PROFESOR".equals(request.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tipo de cuenta inválido.");
        }

        User user = new User();
        user.setNombre(request.getNombre() != null ? request.getNombre() : "Usuario");
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        if ("PROFESOR".equals(request.getRole())) {
            user.setStatus("PENDING");
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Solicitud enviada. Un administrador debe aprobar tu cuenta de profesor.");
        }

        if (request.getProfesorEmail() == null || request.getProfesorEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El cliente debe indicar un profesor.");
        }
        User profesor = userRepository.findByEmail(request.getProfesorEmail()).orElse(null);
        if (profesor == null || !"PROFESOR".equals(profesor.getRole()) || !"ACTIVE".equals(profesor.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El profesor indicado no está disponible.");
        }
        user.setStatus("ACTIVE");
        user.setProfesor(profesor);
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado exitosamente");
    }
}
