package com.cdac.cssip.user.config;

import com.cdac.cssip.common.enums.Role;
import com.cdac.cssip.user.entity.User;
import com.cdac.cssip.user.repository.UserRepository;
import com.cdac.cssip.common.enums.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seed(UserRepository r) {
        return a -> {
            if (r.findByCdacId("ADMIN001").isEmpty())
                r.save(User.builder().cdacId("ADMIN001").fullName("System Administrator").email("admin@cdac.in").password(new BCryptPasswordEncoder().encode("Admin@123")).role(Role.ADMIN).status(UserStatus.APPROVED).build());
        };
    }
}
