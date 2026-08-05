package com.cdac.cssip.user.controller;

import com.cdac.cssip.common.enums.UserStatus;
import com.cdac.cssip.user.dto.UserDtos.BranchRequest;
import com.cdac.cssip.user.dto.UserDtos.BranchView;
import com.cdac.cssip.user.dto.UserDtos.UserView;
import com.cdac.cssip.user.service.UserFacade;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.cdac.cssip.user.dto.UserDtos.BranchStatusRequest;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserFacade facade;

    @GetMapping("/users")
    public List<UserView> all() {
        return facade.all();
    }

    @GetMapping("/users/pending")
    public List<UserView> pending() {
        return facade.pending();
    }

    @GetMapping("/users/{id}")
    public UserView one(@PathVariable Long id) {
        return facade.byId(id);
    }

    @PutMapping("/users/{id}/approve")
    public UserView approve(@PathVariable Long id) {
        return facade.status(id, UserStatus.APPROVED);
    }

    @PutMapping("/users/{id}/reject")
    public UserView reject(@PathVariable Long id) {
        return facade.status(id, UserStatus.REJECTED);
    }

    @PutMapping("/users/{id}/block")
    public UserView block(@PathVariable Long id) {
        return facade.status(id, UserStatus.BLOCKED);
    }

    @PutMapping("/users/{id}/unblock")
    public UserView unblock(@PathVariable Long id) {
        return facade.status(id, UserStatus.APPROVED);
    }

    @PostMapping("/branches")
    public BranchView createBranch(
            @Valid @RequestBody BranchRequest request
    ) {
        return facade.createBranch(request);
    }

    @GetMapping("/branches")
    public List<BranchView> branches() {
        return facade.branches();
    }

    @GetMapping("/branches/{id}")
    public BranchView branchById(@PathVariable Long id) {
        return facade.branch(id);
    }

    @PutMapping("/branches/{id}")
    public BranchView updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody BranchRequest request
    ) {
        return facade.updateBranch(id, request);
    }

    @PutMapping("/branches/{id}/status")
    public BranchView updateBranchStatus(
            @PathVariable Long id,
            @Valid @RequestBody BranchStatusRequest request
    ) {
        return facade.updateBranchStatus(id, request.active());
    }
}