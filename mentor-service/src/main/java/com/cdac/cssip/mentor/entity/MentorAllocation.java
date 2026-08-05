package com.cdac.cssip.mentor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.*;

@Entity
@Table(name = "mentor_allocations", uniqueConstraints = @UniqueConstraint(columnNames = "student_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(name = "staff_id", nullable = false)
    Long staffId;
    @Column(name = "student_id", nullable = false)
    Long studentId;
    @Column(name = "branch_id", nullable = false)
    Long branchId;
    String allocatedBy;
    LocalDateTime allocatedOn;
}