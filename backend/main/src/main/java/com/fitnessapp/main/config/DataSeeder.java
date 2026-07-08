package com.fitnessapp.main.config;

import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
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
            
            userRepository.save(admin);
            System.out.println("✅ Usuario ADMIN creado exitosamente (admin@fitnessapp.com / admin123)");
        } else {
            System.out.println("✅ Usuario ADMIN ya existe en la base de datos.");
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
            
            userRepository.save(client);
            System.out.println("✅ Usuario CLIENTE creado exitosamente (cliente@fitnessapp.com / cliente123)");
        } else {
            System.out.println("✅ Usuario CLIENTE ya existe en la base de datos.");
        }
    }
}
