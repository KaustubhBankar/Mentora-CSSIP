package com.cdac.cssip.task.entity;

import com.cdac.cssip.task.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "task_submissions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_task_student_submission",
                columnNames = {"task_id", "student_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    private String studentName;
    private String studentCdacId;

    @Column(length = 1000)
    private String githubUrl;

    @Column(length = 1000)
    private String submissionNote;

    private String fileOriginalName;
    private String fileStoredName;
    private String fileContentType;
    private Long fileSize;

    @Column(length = 500)
    private String filePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubmissionStatus status;

    @Column(length = 2000)
    private String staffFeedback;

    private Long reviewedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    @Column(nullable = false)
    private Integer attemptNumber;

    @Column(nullable = false)
    private Boolean lateSubmission;

    @PrePersist
    void prePersist() {
        if (status == null) {
            status = SubmissionStatus.SUBMITTED;
        }
        if (attemptNumber == null) {
            attemptNumber = 1;
        }
        if (lateSubmission == null) {
            lateSubmission = false;
        }
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }
}
