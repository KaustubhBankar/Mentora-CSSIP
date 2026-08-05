# CSSIP API Testing

Start services in this order: Eureka (8761), User (8082), Auth (8081), Mentor (8083), Task (8084), Meeting (8085), Gateway (8080), then Frontend (5173).

Use `Authorization: Bearer <JWT>` for protected endpoints.

## Mentor/group

- `GET /api/mentor/my-group` — STUDENT
- `GET /api/mentor/my-mentor` — STUDENT
- `GET /api/mentor/my-students` — STAFF

A student without an allocation receives `404` with `Group not assigned` instead of a generic 400.

## Task creation with assignment attachment

`POST /api/tasks` — STAFF — `multipart/form-data`

Part name `data`, content type `application/json`:

```json
{
  "branchId": 1,
  "title": "Spring Boot Assignment",
  "description": "Implement CRUD and upload the solution.",
  "dueAt": "2026-08-20T18:00:00",
  "studentIds": [4, 5],
  "allowFileSubmission": true,
  "allowGithubSubmission": true
}
```

Optional part name `attachment`: PDF, DOC, DOCX, TXT, ZIP, PNG, JPG, or JPEG, maximum 20 MB.

Other staff task endpoints:

- `GET /api/tasks/staff`
- `PUT /api/tasks/{taskId}`
- `DELETE /api/tasks/{taskId}`
- `GET /api/tasks/{taskId}/attachment`

## Student task submission

`POST /api/tasks/{taskId}/submissions` — STUDENT — `multipart/form-data`

Part name `data`, content type `application/json`:

```json
{
  "githubUrl": "https://github.com/username/project",
  "note": "Run the project using the instructions in README.md"
}
```

Optional part name `file`: PDF, DOC, DOCX, TXT, ZIP, PNG, JPG, or JPEG.

At least one of `githubUrl` or `file` is required.

Student endpoints:

- `GET /api/tasks/student`
- `GET /api/tasks/student/submissions`
- `POST /api/tasks/{taskId}/submissions`
- `GET /api/tasks/{taskId}/attachment`
- `GET /api/tasks/submissions/{submissionId}/file`

## Staff submission review

- `GET /api/tasks/{taskId}/submissions`
- `GET /api/tasks/submissions/{submissionId}/file`
- `PUT /api/tasks/submissions/{submissionId}/review`

Approve:

```json
{
  "status": "APPROVED",
  "feedback": "Correct implementation. Task approved."
}
```

Request changes:

```json
{
  "status": "CHANGES_REQUIRED",
  "feedback": "Add validation and update README with execution steps."
}
```

Students cannot mark a task complete directly. The assignment becomes `COMPLETED` only after staff approval.

## Online meetings

`POST /api/meetings` — STAFF

```json
{
  "branchId": 1,
  "title": "Weekly review",
  "agenda": "Progress and blockers",
  "platform": "GOOGLE_MEET",
  "meetingLink": "https://meet.google.com/example",
  "scheduledAt": "2026-08-20T18:30:00",
  "durationMinutes": 60,
  "studentIds": [4, 5]
}
```

- `GET /api/meetings/staff` — STAFF
- `PUT /api/meetings/{id}` — STAFF
- `PUT /api/meetings/{id}/cancel` — STAFF, body `{"reason":"Rescheduled"}`
- `GET /api/meetings/student` — STUDENT
