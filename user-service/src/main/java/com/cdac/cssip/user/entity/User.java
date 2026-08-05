package com.cdac.cssip.user.entity;

import com.cdac.cssip.common.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "cdac_id", unique = true, nullable = false)
    private String cdacId;
    @Column(nullable = false)
    private String fullName;
    @Column(unique = true, nullable = false)
    private String email;
    @Column(nullable = false)
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;
    private String phone;
    private String githubUrl;
    private String linkedinUrl;
    private String specialization;
    @Column(length = 500)
    private String skills;
    @Column(length = 1000)
    private String bio;
    private String profileImage;
    private String designation;
    private String department;
    private String organization;
    private String expertise;
    @ManyToOne(fetch = FetchType.LAZY)
    private Branch branch;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void pre() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void upd() {
        updatedAt = LocalDateTime.now();
    }
}
