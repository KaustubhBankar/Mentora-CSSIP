package com.cdac.cssip.auth.client;

import com.cdac.cssip.common.enums.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {
    record CreateUser(String cdacId, String fullName, String email, String password, Role role) {
    }

    record UserView(Long id, String cdacId, String fullName, String email, String password, Role role,
                    UserStatus status, Long branchId, String branchName, String phone, String githubUrl,
                    String linkedinUrl, String specialization, String skills, String bio, String designation,
                    String department, String organization, String expertise) {
    }

    @PostMapping("/internal/users")
    UserView create(@RequestBody CreateUser c, @RequestHeader("X-Internal-Api-Key") String key);

    @GetMapping("/internal/users/by-cdac-id/{id}")
    UserView byCdac(@PathVariable("id") String id, @RequestHeader("X-Internal-Api-Key") String key);
}
