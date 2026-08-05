# Task Submission and Review Implementation

The updated project replaces the unsafe student-side “Mark complete” workflow with a Google Classroom-style review flow:

1. Staff creates a task and may attach an assignment file.
2. Staff controls whether file and GitHub submissions are accepted.
3. Student downloads the assignment and submits a file, a secure GitHub URL, or both.
4. The service records attempt number, submission time, and whether the submission is late.
5. Staff downloads the submitted file, opens GitHub, gives feedback, and either approves or requests changes.
6. A task assignment changes to `COMPLETED` only after staff approval.

Upload directories are created automatically under:

- `task-service/uploads/task-assignments`
- `task-service/uploads/task-submissions`

For production deployment, replace local file storage with object storage such as S3/MinIO and store only object keys in the database.
