package com.cdac.cssip.user.service;

import com.cdac.cssip.common.enums.Role;
import com.cdac.cssip.common.enums.UserStatus;
import com.cdac.cssip.user.dto.UserDtos.*;
import com.cdac.cssip.user.entity.Branch;
import com.cdac.cssip.user.entity.User;
import com.cdac.cssip.user.repository.BranchRepository;
import com.cdac.cssip.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class UserFacade {

    private final UserRepository users;
    private final BranchRepository branches;

    public UserView create(CreateUser request) {

        if (users.existsByCdacId(request.cdacId())) {
            throw new IllegalArgumentException(
                    "CDAC ID already registered"
            );
        }

        if (users.existsByEmail(request.email())) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        User user = User.builder()
                .cdacId(request.cdacId())
                .fullName(request.fullName())
                .email(request.email())
                .password(request.password())
                .role(request.role())
                .status(UserStatus.PENDING)
                .build();

        return map(users.save(user));
    }

    @Transactional(readOnly = true)
    public UserView byCdac(String cdacId) {
        User user = users.findByCdacId(cdacId)
                .orElseThrow(() ->
                        new NoSuchElementException("User not found")
                );

        return map(user);
    }

    @Transactional(readOnly = true)
    public UserView byId(Long id) {
        return map(find(id));
    }

    public UserView status(Long id, UserStatus status) {
        User user = find(id);
        user.setStatus(status);

        return map(user);
    }

    @Transactional(readOnly = true)
    public List<UserView> all() {
        return users.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserView> pending() {
        return users.findByStatus(UserStatus.PENDING)
                .stream()
                .map(this::map)
                .toList();
    }

    public UserView studentUpdate(
            Long id,
            StudentUpdate request
    ) {
        User user = find(id);

        ensure(user, Role.STUDENT);

        user.setPhone(request.phone());
        user.setGithubUrl(request.githubUrl());
        user.setLinkedinUrl(request.linkedinUrl());
        user.setSpecialization(request.specialization());
        user.setSkills(request.skills());
        user.setBio(request.bio());
        user.setProfileImage(request.profileImage());

        return map(user);
    }

    public UserView staffUpdate(
            Long id,
            StaffUpdate request
    ) {
        User user = find(id);

        ensure(user, Role.STAFF);

        user.setPhone(request.phone());
        user.setGithubUrl(request.githubUrl());
        user.setLinkedinUrl(request.linkedinUrl());
        user.setBio(request.bio());
        user.setDesignation(request.designation());
        user.setDepartment(request.department());
        user.setOrganization(request.organization());
        user.setExpertise(request.expertise());

        return map(user);
    }

    @Transactional(readOnly = true)
    public List<UserView> students() {
        return users.findByRole(Role.STUDENT)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserView> searchStudents(String keyword) {
        return users.search(Role.STUDENT, keyword)
                .stream()
                .map(this::map)
                .toList();
    }

    public BranchView createBranch(BranchRequest request) {

        String branchCode =
                request.branchCode()
                        .trim()
                        .toUpperCase();

        if (branches.existsByBranchCode(branchCode)) {
            throw new IllegalArgumentException(
                    "Branch code exists"
            );
        }

        Branch branch = Branch.builder()
                .branchCode(branchCode)
                .branchName(request.branchName().trim())
                .batchYear(request.batchYear())
                .center(request.center().trim())
                .active(true)
                .build();

        return bm(branches.save(branch));
    }

    @Transactional(readOnly = true)
    public List<BranchView> branches() {
        return branches.findAll()
                .stream()
                .map(this::bm)
                .toList();
    }

    @Transactional(readOnly = true)
    public BranchView branch(Long id) {
        Branch branch = branches.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Branch not found"
                        )
                );

        return bm(branch);
    }

    public BranchView updateBranch(
            Long branchId,
            BranchRequest request
    ) {
        Branch branch = branches.findById(branchId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Branch not found"
                        )
                );

        String newBranchCode =
                request.branchCode()
                        .trim()
                        .toUpperCase();

        boolean branchCodeChanged =
                !branch.getBranchCode()
                        .equalsIgnoreCase(newBranchCode);

        if (
                branchCodeChanged &&
                        branches.existsByBranchCode(newBranchCode)
        ) {
            throw new IllegalArgumentException(
                    "Branch code already exists"
            );
        }

        branch.setBranchCode(newBranchCode);
        branch.setBranchName(
                request.branchName().trim()
        );
        branch.setBatchYear(
                request.batchYear()
        );
        branch.setCenter(
                request.center().trim()
        );

        return bm(branches.save(branch));
    }

    public BranchView updateBranchStatus(
            Long branchId,
            Boolean active
    ) {
        if (active == null) {
            throw new IllegalArgumentException(
                    "Branch active status is required"
            );
        }

        Branch branch = branches.findById(branchId)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "Branch not found with id: " + branchId
                        )
                );

        branch.setActive(active);

        return bm(branches.save(branch));
    }

    private User find(Long id) {
        return users.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException("User not found")
                );
    }

    private void ensure(User user, Role requiredRole) {
        if (user.getRole() != requiredRole) {
            throw new IllegalArgumentException(
                    "User role mismatch"
            );
        }
    }

    private BranchView bm(Branch branch) {
        return new BranchView(
                branch.getId(),
                branch.getBranchCode(),
                branch.getBranchName(),
                branch.getBatchYear(),
                branch.getCenter(),
                branch.getActive()
        );
    }

    private UserView map(User user) {
        Branch branch = user.getBranch();

        return new UserView(
                user.getId(),
                user.getCdacId(),
                user.getFullName(),
                user.getEmail(),
                user.getPassword(),
                user.getRole(),
                user.getStatus(),

                branch == null
                        ? null
                        : branch.getId(),

                branch == null
                        ? null
                        : branch.getBranchName(),

                user.getPhone(),
                user.getGithubUrl(),
                user.getLinkedinUrl(),
                user.getSpecialization(),
                user.getSkills(),
                user.getBio(),
                user.getDesignation(),
                user.getDepartment(),
                user.getOrganization(),
                user.getExpertise()
        );
    }
}