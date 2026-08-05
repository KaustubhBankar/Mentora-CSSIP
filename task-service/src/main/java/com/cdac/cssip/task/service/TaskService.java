package com.cdac.cssip.task.service;

import com.cdac.cssip.common.enums.Role;
import com.cdac.cssip.task.client.UserServiceClient;
import com.cdac.cssip.task.dto.TaskDtos.*;
import com.cdac.cssip.task.entity.*;
import com.cdac.cssip.task.enums.SubmissionStatus;
import com.cdac.cssip.task.repository.*;
import com.cdac.cssip.task.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository tasks;
    private final TaskAssignmentRepository assignments;
    private final TaskSubmissionRepository submissions;
    private final UserServiceClient users;
    private final FileStorageService fileStorage;

    @Value("${internal.api-key}")
    private String key;

    public TaskView create(
            Long staffId,
            CreateTaskRequest request,
            MultipartFile attachment
    ) {
        for (Long studentId : request.studentIds()) {
            var user = users.user(studentId, key);

            if (user.role() != Role.STUDENT) {
                throw new IllegalArgumentException(
                        "User " + studentId + " is not STUDENT"
                );
            }
        }

        Task task = Task.builder()
                .staffId(staffId)
                .branchId(request.branchId())
                .title(request.title().trim())
                .description(trim(request.description()))
                .dueAt(request.dueAt())
                .allowFileSubmission(request.fileSubmissionAllowed())
                .allowGithubSubmission(request.githubSubmissionAllowed())
                .build();

        if (attachment != null && !attachment.isEmpty()) {
            var stored = fileStorage.storeAssignment(attachment);
            applyTaskAttachment(task, stored);
        }

        task = tasks.save(task);

        Long taskId = task.getId();

        request.studentIds()
                .stream()
                .filter(Objects::nonNull)
                .distinct()
                .forEach(studentId ->
                        assignments.save(
                                TaskAssignment.builder()
                                        .taskId(taskId)
                                        .studentId(studentId)
                                        .status("PENDING")
                                        .build()
                        )
                );

        return view(task, null, null);
    }

    public TaskView update(
            Long staffId,
            Long taskId,
            UpdateTaskRequest request
    ) {
        Task task = owned(staffId, taskId);

        task.setTitle(request.title().trim());
        task.setDescription(trim(request.description()));
        task.setDueAt(request.dueAt());
        task.setAllowFileSubmission(
                request.fileSubmissionAllowed()
        );
        task.setAllowGithubSubmission(
                request.githubSubmissionAllowed()
        );

        return view(tasks.save(task), null, null);
    }

    public void delete(Long staffId, Long taskId) {
        Task task = owned(staffId, taskId);

        submissions.findByTaskIdOrderBySubmittedAtDesc(taskId)
                .forEach(submission ->
                        fileStorage.delete(submission.getFilePath())
                );

        submissions.deleteByTaskId(taskId);
        assignments.deleteByTaskId(taskId);
        fileStorage.delete(task.getAttachmentPath());
        tasks.deleteById(taskId);
    }

    @Transactional(readOnly = true)
    public List<TaskView> staff(Long staffId) {
        return tasks.findByStaffIdOrderByCreatedAtDesc(staffId)
                .stream()
                .map(task -> view(task, null, null))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskView> student(Long studentId) {
        return assignments.findByStudentId(studentId)
                .stream()
                .map(assignment -> {
                    Task task = tasks.findById(assignment.getTaskId())
                            .orElseThrow();

                    TaskSubmission submission = submissions
                            .findByTaskIdAndStudentId(
                                    task.getId(),
                                    studentId
                            )
                            .orElse(null);

                    return view(
                            task,
                            assignment.getStatus(),
                            submission
                    );
                })
                .sorted(Comparator.comparing(TaskView::dueAt))
                .toList();
    }

    public TaskSubmissionView submitTask(
            Long taskId,
            Long studentId,
            SubmitTaskRequest request,
            MultipartFile file
    ) {
        Task task = tasks.findById(taskId)
                .orElseThrow(() ->
                        new NoSuchElementException("Task not found")
                );

        if (!assignments.existsByTaskIdAndStudentId(
                taskId,
                studentId
        )) {
            throw new SecurityException(
                    "This task is not assigned to you"
            );
        }

        String githubUrl = normalizeGithubUrl(request.githubUrl());
        boolean hasFile = file != null && !file.isEmpty();

        if (!hasFile && githubUrl == null) {
            throw new IllegalArgumentException(
                    "Upload a solution file or provide a GitHub link"
            );
        }

        if (hasFile && !Boolean.TRUE.equals(
                task.getAllowFileSubmission()
        )) {
            throw new IllegalStateException(
                    "File submission is not allowed for this task"
            );
        }

        if (githubUrl != null && !Boolean.TRUE.equals(
                task.getAllowGithubSubmission()
        )) {
            throw new IllegalStateException(
                    "GitHub submission is not allowed for this task"
            );
        }

        TaskSubmission submission = submissions
                .findByTaskIdAndStudentId(taskId, studentId)
                .orElseGet(() ->
                        TaskSubmission.builder()
                                .taskId(taskId)
                                .studentId(studentId)
                                .attemptNumber(0)
                                .lateSubmission(false)
                                .build()
                );

        if (submission.getStatus() == SubmissionStatus.APPROVED) {
            throw new IllegalStateException(
                    "Approved submission cannot be changed"
            );
        }

        var student = users.user(studentId, key);
        submission.setStudentName(student.fullName());
        submission.setStudentCdacId(student.cdacId());

        if (hasFile) {
            fileStorage.delete(submission.getFilePath());

            var stored = fileStorage.storeSubmission(file);

            submission.setFileOriginalName(stored.originalName());
            submission.setFileStoredName(stored.storedName());
            submission.setFileContentType(stored.contentType());
            submission.setFileSize(stored.size());
            submission.setFilePath(stored.path());
        }

        submission.setGithubUrl(githubUrl);
        submission.setSubmissionNote(trim(request.note()));
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setStaffFeedback(null);
        submission.setReviewedBy(null);
        submission.setReviewedAt(null);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setAttemptNumber(
                Optional.ofNullable(submission.getAttemptNumber())
                        .orElse(0) + 1
        );
        submission.setLateSubmission(
                LocalDateTime.now().isAfter(task.getDueAt())
        );

        TaskAssignment assignment = assignments
                .findByTaskIdAndStudentId(taskId, studentId)
                .orElseThrow();

        assignment.setStatus("SUBMITTED");
        assignments.save(assignment);

        return submissionView(submissions.save(submission));
    }

    @Transactional(readOnly = true)
    public List<TaskSubmissionView> getTaskSubmissions(
            Long taskId,
            Long staffId
    ) {
        owned(staffId, taskId);

        return submissions
                .findByTaskIdOrderBySubmittedAtDesc(taskId)
                .stream()
                .map(this::submissionView)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskSubmissionView> getStudentSubmissions(
            Long studentId
    ) {
        return submissions
                .findByStudentIdOrderBySubmittedAtDesc(studentId)
                .stream()
                .map(this::submissionView)
                .toList();
    }

    public TaskSubmissionView reviewSubmission(
            Long submissionId,
            Long staffId,
            ReviewSubmissionRequest request
    ) {
        TaskSubmission submission = submissions
                .findById(submissionId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Submission not found"
                        )
                );

        Task task = owned(staffId, submission.getTaskId());

        if (
                request.status() != SubmissionStatus.APPROVED &&
                request.status() != SubmissionStatus.CHANGES_REQUIRED &&
                request.status() != SubmissionStatus.UNDER_REVIEW
        ) {
            throw new IllegalArgumentException(
                    "Review status must be APPROVED, CHANGES_REQUIRED, or UNDER_REVIEW"
            );
        }

        if (
                request.status() == SubmissionStatus.CHANGES_REQUIRED &&
                (request.feedback() == null ||
                        request.feedback().isBlank())
        ) {
            throw new IllegalArgumentException(
                    "Feedback is required when requesting changes"
            );
        }

        submission.setStatus(request.status());
        submission.setStaffFeedback(trim(request.feedback()));
        submission.setReviewedBy(staffId);
        submission.setReviewedAt(LocalDateTime.now());

        TaskAssignment assignment = assignments
                .findByTaskIdAndStudentId(
                        task.getId(),
                        submission.getStudentId()
                )
                .orElseThrow();

        assignment.setStatus(
                request.status() == SubmissionStatus.APPROVED
                        ? "COMPLETED"
                        : request.status().name()
        );

        if (request.status() == SubmissionStatus.APPROVED) {
            assignment.setCompletedAt(LocalDateTime.now());
        } else {
            assignment.setCompletedAt(null);
        }

        assignments.save(assignment);

        return submissionView(submissions.save(submission));
    }

    @Transactional(readOnly = true)
    public TaskFileDownload getAuthorizedSubmissionFile(
            Long submissionId,
            Long userId,
            Role role
    ) {
        TaskSubmission submission = submissions.findById(submissionId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Submission not found"
                        )
                );

        Task task = tasks.findById(submission.getTaskId())
                .orElseThrow();

        boolean authorized =
                role == Role.STAFF && task.getStaffId().equals(userId) ||
                role == Role.STUDENT &&
                        submission.getStudentId().equals(userId);

        if (!authorized) {
            throw new SecurityException(
                    "You cannot download this submission"
            );
        }

        if (submission.getFilePath() == null) {
            throw new NoSuchElementException(
                    "No file was uploaded for this submission"
            );
        }

        return new TaskFileDownload(
                fileStorage.load(submission.getFilePath()),
                submission.getFileOriginalName(),
                defaultContentType(
                        submission.getFileContentType()
                )
        );
    }

    @Transactional(readOnly = true)
    public TaskFileDownload getAuthorizedTaskAttachment(
            Long taskId,
            Long userId,
            Role role
    ) {
        Task task = tasks.findById(taskId)
                .orElseThrow(() ->
                        new NoSuchElementException("Task not found")
                );

        boolean authorized =
                role == Role.STAFF && task.getStaffId().equals(userId) ||
                role == Role.STUDENT &&
                        assignments.existsByTaskIdAndStudentId(
                                taskId,
                                userId
                        );

        if (!authorized) {
            throw new SecurityException(
                    "You cannot download this task attachment"
            );
        }

        if (task.getAttachmentPath() == null) {
            throw new NoSuchElementException(
                    "This task has no attachment"
            );
        }

        return new TaskFileDownload(
                fileStorage.load(task.getAttachmentPath()),
                task.getAttachmentOriginalName(),
                defaultContentType(
                        task.getAttachmentContentType()
                )
        );
    }

    private Task owned(Long staffId, Long taskId) {
        Task task = tasks.findById(taskId)
                .orElseThrow(() ->
                        new NoSuchElementException("Task not found")
                );

        if (!task.getStaffId().equals(staffId)) {
            throw new SecurityException(
                    "You cannot modify another mentor's task"
            );
        }

        return task;
    }

    private TaskView view(
            Task task,
            String status,
            TaskSubmission submission
    ) {
        List<Long> studentIds = assignments
                .findByTaskId(task.getId())
                .stream()
                .map(TaskAssignment::getStudentId)
                .toList();

        return new TaskView(
                task.getId(),
                task.getStaffId(),
                task.getBranchId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueAt(),
                task.getCreatedAt(),
                status == null ? "ACTIVE" : status,
                studentIds,
                task.getAllowFileSubmission(),
                task.getAllowGithubSubmission(),
                task.getAttachmentOriginalName(),
                task.getAttachmentPath() != null,
                submission == null
                        ? null
                        : submissionView(submission)
        );
    }

    private TaskSubmissionView submissionView(
            TaskSubmission submission
    ) {
        return new TaskSubmissionView(
                submission.getId(),
                submission.getTaskId(),
                submission.getStudentId(),
                submission.getStudentName(),
                submission.getStudentCdacId(),
                submission.getGithubUrl(),
                submission.getSubmissionNote(),
                submission.getFileOriginalName(),
                submission.getFileSize(),
                submission.getFilePath() != null,
                submission.getStatus(),
                submission.getStaffFeedback(),
                submission.getAttemptNumber(),
                submission.getLateSubmission(),
                submission.getSubmittedAt(),
                submission.getReviewedAt()
        );
    }

    private void applyTaskAttachment(
            Task task,
            FileStorageService.StoredFile stored
    ) {
        task.setAttachmentOriginalName(stored.originalName());
        task.setAttachmentStoredName(stored.storedName());
        task.setAttachmentContentType(stored.contentType());
        task.setAttachmentSize(stored.size());
        task.setAttachmentPath(stored.path());
    }

    private String normalizeGithubUrl(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String url = value.trim();

        if (!url.startsWith("https://github.com/")) {
            throw new IllegalArgumentException(
                    "Enter a secure GitHub repository URL beginning with https://github.com/"
            );
        }

        return url;
    }

    private String trim(String value) {
        return value == null || value.isBlank()
                ? null
                : value.trim();
    }

    private String defaultContentType(String value) {
        return value == null || value.isBlank()
                ? "application/octet-stream"
                : value;
    }
}
