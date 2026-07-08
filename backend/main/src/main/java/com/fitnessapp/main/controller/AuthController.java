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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // Autenticar con el email (que usamos como username) y la contraseña
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Si la autenticación es exitosa, se establece en el contexto
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generar el token JWT
        String jwt = tokenProvider.generateToken(authentication);
        
        // Devolver el token envuelto en el DTO (que se asume existe en dto.JwtAuthResponse)
        JwtAuthResponse response = new JwtAuthResponse(jwt);
        
        return ResponseEntity.ok(response);
    }
}
