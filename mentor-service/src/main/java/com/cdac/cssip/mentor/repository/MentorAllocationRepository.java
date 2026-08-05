package com.cdac.cssip.mentor.repository;
import com.cdac.cssip.mentor.entity.MentorAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MentorAllocationRepository extends JpaRepository<MentorAllocation,Long>{
 Optional<MentorAllocation> findByStudentId(Long id);
 List<MentorAllocation> findByStaffId(Long id);
 List<MentorAllocation> findByStaffIdAndBranchId(Long staffId,Long branchId);
 boolean existsByStaffIdAndBranchId(Long staffId,Long branchId);
}
