package com.cdac.cssip.task.repository;

import com.cdac.cssip.task.entity.TaskSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskSubmissionRepository
        extends JpaRepository<TaskSubmission, Long> {

    Optional<TaskSubmission> findByTaskIdAndStudentId(
            Long taskId,
            Long studentId
    );

    List<TaskSubmission> findByTaskIdOrderBySubmittedAtDesc(
            Long taskId
    );

    List<TaskSubmission> findByStudentIdOrderBySubmittedAtDesc(
            Long studentId
    );

    boolean existsByTaskIdAndStudentId(
            Long taskId,
            Long studentId
    );

    void deleteByTaskId(Long taskId);
}
