package com.cdac.cssip.auth;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "com.cdac.cssip")
@EnableFeignClients
public class AuthServiceApplication {
    public static void main(String[] a) {
        SpringApplication.run(AuthServiceApplication.class, a);
    }
}