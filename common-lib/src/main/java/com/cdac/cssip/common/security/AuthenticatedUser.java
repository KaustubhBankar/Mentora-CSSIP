package com.cdac.cssip.common.security;
import com.cdac.cssip.common.enums.Role;
public record AuthenticatedUser(Long userId, String cdacId, String fullName, Role role) {}
