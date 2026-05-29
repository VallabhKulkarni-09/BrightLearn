package com.brightlearn.config;

import com.brightlearn.entity.Role;
import com.brightlearn.entity.User;
import com.brightlearn.repository.RoleRepository;
import com.brightlearn.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // 1. Initialize Roles if they don't exist
            initRole(roleRepository, "STUDENT");
            initRole(roleRepository, "INSTRUCTOR");
            Role adminRole = initRole(roleRepository, "ADMIN");

            // 2. Create or Reset Default Admin to ensure password is admin123
            User admin = userRepository.findByUsername("admin").orElseGet(User::new);
            admin.setUsername("admin");
            if (admin.getEmail() == null) {
                admin.setEmail("admin@brightlearn.com");
            }
            if (admin.getMobileNumber() == null) {
                admin.setMobileNumber("0000000000");
            }
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRoles(Set.of(adminRole));
            admin.setActive(true);
            
            userRepository.save(admin);
            System.out.println(">>> Default Admin created/reset: admin / admin123");
        };
    }

    private Role initRole(RoleRepository repository, String roleName) {
        return repository.findByName(roleName)
                .orElseGet(() -> {
                    Role saved = repository.save(new Role(roleName));
                    System.out.println(">>> Role created: " + roleName);
                    return saved;
                });
    }
}
