# CSSIP End-to-End Test Order

Base URL through API Gateway: `http://localhost:8080`

## 1. Start services

Start Eureka first, then User, Auth, Mentor, and Gateway. Confirm Eureka at `http://localhost:8761` shows `USER-SERVICE`, `AUTH-SERVICE`, `MENTOR-SERVICE`, and `API-GATEWAY`.

## 2. Admin login

`POST /api/auth/login`

```json
{
  "cdacId": "ADMIN001",
  "password": "Admin@123"
}
```

Save the returned token as `ADMIN_TOKEN`.

## 3. Register staff

`POST /api/auth/register`

```json
{
  "cdacId": "STAFF001",
  "fullName": "Staff One",
  "email": "staff1@cdac.in",
  "password": "Staff@123",
  "role": "STAFF"
}
```

## 4. Register student

`POST /api/auth/register`

```json
{
  "cdacId": "STUDENT001",
  "fullName": "Student One",
  "email": "student1@cdac.in",
  "password": "Student@123",
  "role": "STUDENT"
}
```

## 5. List pending users

`GET /api/admin/users/pending`

Header: `Authorization: Bearer ADMIN_TOKEN`

Use the returned numeric IDs for approval.

## 6. Approve staff and student

`PUT /api/admin/users/{id}/approve`

Header: `Authorization: Bearer ADMIN_TOKEN`

## 7. Create branch

`POST /api/admin/branches`

Header: `Authorization: Bearer ADMIN_TOKEN`

```json
{
  "branchCode": "PGDAC",
  "branchName": "PG-DAC",
  "batchYear": 2026,
  "center": "CDAC"
}
```

## 8. Staff login

`POST /api/auth/login`

```json
{
  "cdacId": "STAFF001",
  "password": "Staff@123"
}
```

## 9. Student login

`POST /api/auth/login`

```json
{
  "cdacId": "STUDENT001",
  "password": "Student@123"
}
```

## 10. Profiles

- `GET /api/staff/profile` using the staff token
- `PUT /api/staff/profile` using the staff token
- `GET /api/student/profile` using the student token
- `PUT /api/student/profile` using the student token

Student update example:

```json
{
  "phone": "9876543210",
  "githubUrl": "https://github.com/student",
  "linkedinUrl": "https://linkedin.com/in/student",
  "specialization": "Java",
  "skills": "Spring Boot, React",
  "bio": "PG-DAC student",
  "profileImage": null
}
```

Staff update example:

```json
{
  "phone": "9876543211",
  "githubUrl": "https://github.com/staff",
  "linkedinUrl": "https://linkedin.com/in/staff",
  "bio": "Mentor",
  "designation": "Technical Trainer",
  "department": "ACTS",
  "organization": "CDAC",
  "expertise": "Java and Spring"
}
```

## 11. Allocate mentor

`POST /api/mentor/allocate`

Header: `Authorization: Bearer ADMIN_TOKEN`

```json
{
  "staffId": 2,
  "studentIds": [3],
  "branchId": 1
}
```

Replace IDs with values returned by `/api/admin/users` and `/api/admin/branches`.

## 12. Mentor dashboards

- `GET /api/mentor/my-students` using the staff token
- `GET /api/mentor/my-mentor` using the student token

## Additional admin endpoints

- `GET /api/admin/users`
- `GET /api/admin/users/{id}`
- `PUT /api/admin/users/{id}/reject`
- `PUT /api/admin/users/{id}/block`
- `PUT /api/admin/users/{id}/unblock`
- `GET /api/admin/branches`

## Add another pre-issued CDAC ID

`POST /api/auth/valid-ids`

Header: `X-Bootstrap-Key: cssip-bootstrap`

```json
{
  "cdacId": "STUDENT003",
  "role": "STUDENT"
}
```
