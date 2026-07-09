package com.fitnessapp.main.controller;

import com.fitnessapp.main.dto.JwtAuthResponse;
import com.fitnessapp.main.dto.LoginRequest;
import com.fitnessapp.main.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.fitnessapp.main.dto.RegisterRequest;
import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtTokenProvider tokenProvider,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El email ya está en uso.");
        }

        User user = new User();
        user.setNombre(registerRequest.getNombre() != null ? registerRequest.getNombre() : "Usuario");
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        
        String role = registerRequest.getRole();
        if (role == null || (!role.equals("ADMIN") && !role.equals("CLIENT"))) {
            role = "CLIENT"; // Default
        }
        user.setRole(role);

        if ("CLIENT".equals(role)) {
            if (registerRequest.getProfesorEmail() == null || registerRequest.getProfesorEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El cliente debe tener un profesor asignado.");
            }
            User profesor = userRepository.findByEmail(registerRequest.getProfesorEmail())
                    .orElse(null);
            if (profesor == null || !"ADMIN".equals(profesor.getRole())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El email del profesor no es válido.");
            }
            user.setProfesor(profesor);
        }

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado exitosamente");
    }
}
