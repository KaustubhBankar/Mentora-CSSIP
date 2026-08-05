package com.cdac.cssip.user.dto;

import com.cdac.cssip.common.enums.*;
import jakarta.validation.constraints.*;

import java.util.*;

public final class UserDtos {
    private UserDtos() {
    }

    public record CreateUser(@NotBlank String cdacId, @NotBlank String fullName, @Email String email,
                             @NotBlank String password, @NotNull Role role) {
    }

    public record UserView(Long id, String cdacId, String fullName, String email, String password, Role role,
                           UserStatus status, Long branchId, String branchName, String phone, String githubUrl,
                           String linkedinUrl, String specialization, String skills, String bio, String designation,
                           String department, String organization, String expertise) {
    }

    public record StatusUpdate(@NotNull UserStatus status) {
    }

    public record StudentUpdate(String phone, String githubUrl, String linkedinUrl, String specialization,
                                String skills, String bio, String profileImage) {
    }

    public record StaffUpdate(String phone, String githubUrl, String linkedinUrl, String bio, String designation,
                              String department, String organization, String expertise) {
    }

    public record BranchRequest(@NotBlank String branchCode, @NotBlank String branchName, @NotNull Integer batchYear,
                                @NotBlank String center) {
    }

    public record BranchView(Long id, String branchCode, String branchName, Integer batchYear, String center, Boolean active) {
    }

    public record BranchStatusRequest(
            @NotNull Boolean active
    ) {
    }
}
