package com.cdac.cssip.task.repository;

import com.cdac.cssip.task.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskAssignmentRepository
        extends JpaRepository<TaskAssignment, Long> {

    List<TaskAssignment> findByTaskId(Long taskId);

    List<TaskAssignment> findByStudentId(Long studentId);

    Optional<TaskAssignment> findByTaskIdAndStudentId(
            Long taskId,
            Long studentId
    );

    boolean existsByTaskIdAndStudentId(
            Long taskId,
            Long studentId
    );

    void deleteByTaskId(Long taskId);
}
