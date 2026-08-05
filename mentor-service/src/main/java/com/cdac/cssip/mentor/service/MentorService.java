package com.cdac.cssip.mentor.service;
import com.cdac.cssip.mentor.client.UserServiceClient;
import com.cdac.cssip.mentor.dto.MentorDtos.*;
import com.cdac.cssip.mentor.entity.MentorAllocation;
import com.cdac.cssip.mentor.repository.MentorAllocationRepository;
import com.cdac.cssip.common.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional
public class MentorService{
 private final MentorAllocationRepository repo; private final UserServiceClient users;
 @Value("${internal.api-key}") String key;
 public List<AllocationView> allocate(AllocateRequest r,String admin){
  var staff=users.user(r.staffId(),key); if(staff.role()!=Role.STAFF) throw new IllegalArgumentException("Selected user is not STAFF");
  var branch=users.branch(r.branchId(),key); List<AllocationView> out=new ArrayList<>();
  for(Long sid:r.studentIds()){
   var st=users.user(sid,key); if(st.role()!=Role.STUDENT) throw new IllegalArgumentException("User "+sid+" is not STUDENT");
   if(repo.findByStudentId(sid).isPresent()) throw new IllegalArgumentException("Student already assigned");
   var a=repo.save(MentorAllocation.builder().staffId(staff.id()).studentId(st.id()).branchId(branch.id()).allocatedBy(admin).allocatedOn(LocalDateTime.now()).build());
   out.add(new AllocationView(a.getId(),staff.id(),staff.fullName(),st.id(),st.fullName(),branch.id(),branch.branchName(),a.getAllocatedOn()));
  } return out;
 }
 @Transactional(readOnly=true) public List<MyStudent> myStudents(Long staffId){return repo.findByStaffId(staffId).stream().map(a->{var s=users.user(a.getStudentId(),key);return new MyStudent(s.id(),s.cdacId(),s.fullName(),s.email(),s.specialization(),s.githubUrl(),s.linkedinUrl());}).toList();}
 @Transactional(readOnly=true) public MyMentor myMentor(Long studentId){var a=repo.findByStudentId(studentId).orElseThrow(()->new NoSuchElementException("Mentor not assigned"));var m=users.user(a.getStaffId(),key);return new MyMentor(m.id(),m.cdacId(),m.fullName(),m.email(),m.phone(),m.designation(),m.department(),m.organization(),m.expertise(),m.githubUrl(),m.linkedinUrl());}
 @Transactional(readOnly=true) public MyGroup myGroup(Long studentId){
  var allocation=repo.findByStudentId(studentId).orElseThrow(()->new NoSuchElementException("Group not assigned"));
  var branch=users.branch(allocation.getBranchId(),key); var mentor=users.user(allocation.getStaffId(),key);
  var members=repo.findByStaffIdAndBranchId(allocation.getStaffId(),allocation.getBranchId()).stream().map(a->{var u=users.user(a.getStudentId(),key);return new GroupMember(u.id(),u.cdacId(),u.fullName(),u.email(),u.specialization());}).toList();
  String name=branch.branchName()+" Mentor Group";
  return new MyGroup(allocation.getBranchId(),name,"Students assigned to the same mentor and branch",branch.id(),branch.branchCode(),branch.branchName(),branch.batchYear(),branch.center(),new GroupMentor(mentor.id(),mentor.cdacId(),mentor.fullName(),mentor.email(),mentor.phone(),mentor.designation()),members);
 }
}
