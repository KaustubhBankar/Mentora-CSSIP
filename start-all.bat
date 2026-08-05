@echo off
start "Eureka" java -jar eureka-server\target\eureka-server-1.0.0.jar
timeout /t 8
start "User" java -jar user-service\target\user-service-1.0.0.jar
start "Auth" java -jar auth-service\target\auth-service-1.0.0.jar
start "Mentor" java -jar mentor-service\target\mentor-service-1.0.0.jar
timeout /t 8
start "Gateway" java -jar api-gateway\target\api-gateway-1.0.0.jar
