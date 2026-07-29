package com.fitnessapp.main.config;

import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.util.Optional;

@Component
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@fitnessapp.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setNombre("Administrador");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            
            userRepository.save(admin);
            System.out.println("✅ Usuario ADMIN creado exitosamente (admin@fitnessapp.com / admin123)");
        } else {
            System.out.println("✅ Usuario ADMIN ya existe en la base de datos.");
        }

        String professorEmail = "profesor@fitnessapp.com";
        if (userRepository.findByEmail(professorEmail).isEmpty()) {
            User professor = new User();
            professor.setNombre("Profesor de Prueba");
            professor.setEmail(professorEmail);
            professor.setPassword(passwordEncoder.encode("profesor123"));
            professor.setRole("PROFESOR");
            professor.setStatus("ACTIVE");
            userRepository.save(professor);
        }

        // Crear usuario CLIENTE de prueba
        String clientEmail = "cliente@fitnessapp.com";
        Optional<User> existingClient = userRepository.findByEmail(clientEmail);
        
        if (existingClient.isEmpty()) {
            User client = new User();
            client.setNombre("Cliente de Prueba");
            client.setEmail(clientEmail);
            client.setPassword(passwordEncoder.encode("cliente123"));
            client.setRole("CLIENT");
            client.setStatus("ACTIVE");
            userRepository.findByEmail(professorEmail).ifPresent(client::setProfesor);
            
            userRepository.save(client);
            System.out.println("✅ Usuario CLIENTE creado exitosamente (cliente@fitnessapp.com / cliente123)");
        } else {
            System.out.println("✅ Usuario CLIENTE ya existe en la base de datos.");
        }
    }
}
