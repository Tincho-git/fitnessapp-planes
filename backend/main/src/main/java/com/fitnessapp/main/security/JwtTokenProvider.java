package com.fitnessapp.main.security;

import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.*;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${app.jwtSecret:SecretKeyToGenJWTs1234567890SecretKeyToGenJWTs1234567890}")
    private String jwtSecret;

    @Value("${app.jwtExpirationInMs:86400000}")
    private int jwtExpirationInMs;

    @Autowired
    private UserRepository userRepository;

    public String generateToken(Authentication authentication) {
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream().findFirst().get().getAuthority().replace("ROLE_", "");

        String nombre = userRepository.findByEmail(email)
                .map(User::getNombre)
                .orElse(email);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("nombre", nombre)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            System.err.println("Token JWT inválido: " + ex.getMessage());
        }
        return false;
    }
}
