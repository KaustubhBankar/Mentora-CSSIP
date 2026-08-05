package com.cdac.cssip.task.controller;

import com.cdac.cssip.common.security.AuthenticatedUser;
import com.cdac.cssip.task.dto.TaskDtos.*;
import com.cdac.cssip.task.service.TaskFileDownload;
import com.cdac.cssip.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF')")
    public TaskView create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestPart("data")
            CreateTaskRequest request,
            @RequestPart(
                    value = "attachment",
                    required = false
            )
            MultipartFile attachment
    ) {
        return service.create(
                user.userId(),
                request,
                attachment
        );
    }

    @PutMapping("/{taskId}")
    @PreAuthorize("hasRole('STAFF')")
    public TaskView update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return service.update(
                user.userId(),
                taskId,
                request
        );
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long taskId
    ) {
        service.delete(user.userId(), taskId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('STAFF')")
    public List<TaskView> staff(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return service.staff(user.userId());
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public List<TaskView> student(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return service.student(user.userId());
    }

    @PostMapping(
            value = "/{taskId}/submissions",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('STUDENT')")
    public TaskSubmissionView submitTask(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long taskId,
            @Valid @RequestPart("data")
            SubmitTaskRequest request,
            @RequestPart(
                    value = "file",
                    required = false
            )
            MultipartFile file
    ) {
        return service.submitTask(
                taskId,
                user.userId(),
                request,
                file
        );
    }

    @GetMapping("/{taskId}/submissions")
    @PreAuthorize("hasRole('STAFF')")
    public List<TaskSubmissionView> getTaskSubmissions(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long taskId
    ) {
        return service.getTaskSubmissions(
                taskId,
                user.userId()
        );
    }

    @GetMapping("/student/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public List<TaskSubmissionView> getStudentSubmissions(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return service.getStudentSubmissions(user.userId());
    }

    @PutMapping("/submissions/{submissionId}/review")
    @PreAuthorize("hasRole('STAFF')")
    public TaskSubmissionView reviewSubmission(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long submissionId,
            @Valid @RequestBody
            ReviewSubmissionRequest request
    ) {
        return service.reviewSubmission(
                submissionId,
                user.userId(),
                request
        );
    }

    @GetMapping("/submissions/{submissionId}/file")
    @PreAuthorize("hasAnyRole('STAFF','STUDENT')")
    public ResponseEntity<?> downloadSubmissionFile(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long submissionId
    ) {
        TaskFileDownload download =
                service.getAuthorizedSubmissionFile(
                        submissionId,
                        user.userId(),
                        user.role()
                );

        return downloadResponse(download);
    }

    @GetMapping("/{taskId}/attachment")
    @PreAuthorize("hasAnyRole('STAFF','STUDENT')")
    public ResponseEntity<?> downloadTaskAttachment(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long taskId
    ) {
        TaskFileDownload download =
                service.getAuthorizedTaskAttachment(
                        taskId,
                        user.userId(),
                        user.role()
                );

        return downloadResponse(download);
    }

    private ResponseEntity<?> downloadResponse(
            TaskFileDownload download
    ) {
        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                download.contentType()
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(download.fileName())
                                .build()
                                .toString()
                )
                .body(download.resource());
    }
}
