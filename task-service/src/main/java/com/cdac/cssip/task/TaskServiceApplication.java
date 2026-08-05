package com.cdac.cssip.task;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class TaskServiceApplication {
    public static void main(String[] a) {
        SpringApplication.run(TaskServiceApplication.class, a);
    }
}
