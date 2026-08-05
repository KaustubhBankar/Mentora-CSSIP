# Implemented changes

## New microservices
- `task-service` on port **8084**
- `meeting-service` on port **8085**

Both services use the existing JWT secret, Eureka discovery, Spring Security role checks, OpenFeign validation against `USER-SERVICE`, JPA, and file-based H2 databases.

## Fixed bug
`GET /api/mentor/my-group` previously had no matching controller endpoint. The mentor service now resolves the logged-in student's allocation, branch, assigned mentor, and other students sharing the same mentor and branch. A student without allocation receives **404 Group not assigned**, rather than the previous generic 400 behavior.

## Frontend
Added protected pages and sidebar routes for:
- Staff task management
- Student tasks
- Staff online meeting scheduling/cancellation
- Student online meetings

## Start order
1. `eureka-server`
2. `user-service` and `auth-service`
3. `mentor-service`
4. `task-service`
5. `meeting-service`
6. `api-gateway`
7. `frontend`

The API gateway remains on port 8080.

## Build note
The project was structurally validated and all frontend JS/JSX files were parser-checked. A full Maven build could not be executed in the artifact environment because Maven dependencies could not be downloaded from the external repository. Run `mvn clean package -DskipTests` or `./mvnw clean package -DskipTests` on a machine with Maven repository access.
