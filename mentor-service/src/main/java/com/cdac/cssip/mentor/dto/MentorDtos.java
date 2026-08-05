package com.cdac.cssip.mentor.dto;
import jakarta.validation.constraints.*;
import java.time.*;
import java.util.*;
public final class MentorDtos{
 private MentorDtos(){}
 public record AllocateRequest(@NotNull Long staffId,@NotEmpty List<Long> studentIds,@NotNull Long branchId){}
 public record AllocationView(Long allocationId,Long staffId,String staffName,Long studentId,String studentName,Long branchId,String branch,LocalDateTime allocatedOn){}
 public record MyStudent(Long id,String cdacId,String fullName,String email,String specialization,String githubUrl,String linkedinUrl){}
 public record MyMentor(Long id,String cdacId,String fullName,String email,String phone,String designation,String department,String organization,String expertise,String githubUrl,String linkedinUrl){}
 public record GroupMentor(Long id,String cdacId,String fullName,String email,String phone,String designation){}
 public record GroupMember(Long id,String cdacId,String fullName,String email,String specialization){}
 public record MyGroup(Long groupId,String groupName,String description,Long branchId,String branchCode,String branchName,Integer batchYear,String center,GroupMentor mentor,List<GroupMember> members){}
}
