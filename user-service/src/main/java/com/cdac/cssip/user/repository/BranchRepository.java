package com.cdac.cssip.user.repository;

import com.cdac.cssip.user.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    boolean existsByBranchCode(String code);
    boolean existsByBranchCodeIgnoreCase(String branchCode);
}