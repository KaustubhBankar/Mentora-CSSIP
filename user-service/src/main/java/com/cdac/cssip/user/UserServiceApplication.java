package com.cdac.cssip.user;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;

@SpringBootApplication(scanBasePackages = "com.cdac.cssip")
public class UserServiceApplication {
    public static void main(String[] a) {
        SpringApplication.run(UserServiceApplication.class, a);
    }
}