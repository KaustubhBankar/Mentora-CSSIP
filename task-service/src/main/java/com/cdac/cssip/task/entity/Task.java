package com.cdac.cssip.task.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long staffId;

    @Column(nullable = false)
    private Long branchId;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(length = 5000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime dueAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean allowFileSubmission;

    @Column(nullable = false)
    private Boolean allowGithubSubmission;

    @Column(length = 255)
    private String attachmentOriginalName;

    @Column(length = 255)
    private String attachmentStoredName;

    @Column(length = 150)
    private String attachmentContentType;

    private Long attachmentSize;

    @Column(length = 500)
    private String attachmentPath;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (allowFileSubmission == null) {
            allowFileSubmission = true;
        }
        if (allowGithubSubmission == null) {
            allowGithubSubmission = true;
        }
    }
}
