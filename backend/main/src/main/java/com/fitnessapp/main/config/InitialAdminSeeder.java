package com.fitnessapp.main.config;

import com.fitnessapp.main.entity.User;
import com.fitnessapp.main.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
public class InitialAdminSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BootstrapAdminProperties properties;

    public InitialAdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                              BootstrapAdminProperties properties) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    public void run(String... args) {
        if (properties.getEmail().isBlank() || properties.getPassword().isBlank()) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_EMAIL y BOOTSTRAP_ADMIN_PASSWORD son obligatorios");
        }
        if (userRepository.findByEmail(properties.getEmail()).isEmpty()) {
            User admin = new User();
            admin.setNombre(properties.getNombre());
            admin.setEmail(properties.getEmail());
            admin.setPassword(passwordEncoder.encode(properties.getPassword()));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
        }
    }
}
