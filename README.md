# CSSIP Microservices

Working microservice conversion of the uploaded monolith.

## Modules and ports
- Eureka Server: 8761
- API Gateway: 8080
- Auth Service: 8081
- User Service: 8082
- Mentor Service: 8083

Default storage is file-based H2, so MySQL is not required. To use MySQL, start a service with `--spring.profiles.active=mysql` and edit its `application-mysql.properties` credentials.

## Build
```bash
mvn clean package -DskipTests
```

## Start in separate terminals
```bash
java -jar eureka-server/target/eureka-server-1.0.0.jar
java -jar user-service/target/user-service-1.0.0.jar
java -jar auth-service/target/auth-service-1.0.0.jar
java -jar mentor-service/target/mentor-service-1.0.0.jar
java -jar api-gateway/target/api-gateway-1.0.0.jar
```

Seeded admin: `ADMIN001` / `Admin@123`. Seeded registration IDs: `STAFF001`, `STUDENT001`, `STUDENT002`.

Import `CSSIP-Microservices.postman_collection.json` for testing. Use the Login requests; their test scripts save JWTs automatically.
