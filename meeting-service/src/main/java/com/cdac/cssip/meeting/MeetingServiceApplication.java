package com.cdac.cssip.meeting;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class MeetingServiceApplication {
    public static void main(String[] a) {
        SpringApplication.run(MeetingServiceApplication.class, a);
    }
}
