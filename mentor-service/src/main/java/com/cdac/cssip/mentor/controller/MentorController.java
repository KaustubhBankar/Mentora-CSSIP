package com.cdac.cssip.mentor.controller;
import com.cdac.cssip.common.security.AuthenticatedUser;
import com.cdac.cssip.mentor.dto.MentorDtos.*;
import com.cdac.cssip.mentor.service.MentorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/mentor") @RequiredArgsConstructor
public class MentorController{
 private final MentorService s;
 @PostMapping("/allocate") @PreAuthorize("hasRole('ADMIN')") public List<AllocationView> allocate(@Valid @RequestBody AllocateRequest r,@AuthenticationPrincipal AuthenticatedUser u){return s.allocate(r,u.cdacId());}
 @GetMapping("/my-students") @PreAuthorize("hasRole('STAFF')") public List<MyStudent> myStudents(@AuthenticationPrincipal AuthenticatedUser u){return s.myStudents(u.userId());}
 @GetMapping("/my-mentor") @PreAuthorize("hasRole('STUDENT')") public MyMentor myMentor(@AuthenticationPrincipal AuthenticatedUser u){return s.myMentor(u.userId());}
 @GetMapping("/my-group") @PreAuthorize("hasRole('STUDENT')") public MyGroup myGroup(@AuthenticationPrincipal AuthenticatedUser u){return s.myGroup(u.userId());}
}
