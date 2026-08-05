package com.cdac.cssip.mentor;

import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.*;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "com.cdac.cssip")
@EnableFeignClients
public class MentorServiceApplication {
    public static void main(String[] a) {
        SpringApplication.run(MentorServiceApplication.class, a);
    }
}