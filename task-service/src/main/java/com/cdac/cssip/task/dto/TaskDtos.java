package com.cdac.cssip.task.dto;

import com.cdac.cssip.task.enums.SubmissionStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public final class TaskDtos {

    private TaskDtos() {
    }

    public record CreateTaskRequest(
            @NotNull Long branchId,
            @NotBlank @Size(max = 160) String title,
            @Size(max = 5000) String description,
            @NotNull @Future LocalDateTime dueAt,
            @NotEmpty List<Long> studentIds,
            Boolean allowFileSubmission,
            Boolean allowGithubSubmission
    ) {
        public boolean fileSubmissionAllowed() {
            return allowFileSubmission == null || allowFileSubmission;
        }

        public boolean githubSubmissionAllowed() {
            return allowGithubSubmission == null || allowGithubSubmission;
        }
    }

    public record UpdateTaskRequest(
            @NotBlank @Size(max = 160) String title,
            @Size(max = 5000) String description,
            @NotNull @Future LocalDateTime dueAt,
            Boolean allowFileSubmission,
            Boolean allowGithubSubmission
    ) {
        public boolean fileSubmissionAllowed() {
            return allowFileSubmission == null || allowFileSubmission;
        }

        public boolean githubSubmissionAllowed() {
            return allowGithubSubmission == null || allowGithubSubmission;
        }
    }

    public record SubmitTaskRequest(
            @Size(max = 1000) String githubUrl,
            @Size(max = 1000) String note
    ) {
    }

    public record ReviewSubmissionRequest(
            @NotNull SubmissionStatus status,
            @Size(max = 2000) String feedback
    ) {
    }

    public record TaskSubmissionView(
            Long id,
            Long taskId,
            Long studentId,
            String studentName,
            String studentCdacId,
            String githubUrl,
            String submissionNote,
            String fileName,
            Long fileSize,
            Boolean hasFile,
            SubmissionStatus status,
            String staffFeedback,
            Integer attemptNumber,
            Boolean lateSubmission,
            LocalDateTime submittedAt,
            LocalDateTime reviewedAt
    ) {
    }

    public record TaskView(
            Long id,
            Long staffId,
            Long branchId,
            String title,
            String description,
            LocalDateTime dueAt,
            LocalDateTime createdAt,
            String status,
            List<Long> studentIds,
            Boolean allowFileSubmission,
            Boolean allowGithubSubmission,
            String attachmentFileName,
            Boolean hasAttachment,
            TaskSubmissionView submission
    ) {
    }
}
