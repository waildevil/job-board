package com.waildevil.job_board_api.security;

import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static void requireEmployee(User user){
        if (!user.isEmployee()){
            throw new ApiException(HttpStatus.FORBIDDEN, "You must be an employee to perform this action.");
        }
    }

    public static void requireRecruiter(User user) {
        if (user.getRole() != Role.RECRUITER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You must be a recruiter to perform this action.");
        }
    }

    public static void requireManager(User user) {
        if (user.getRole() != Role.MANAGER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You must be a manager to perform this action.");
        }
    }

    public static void requireRole(User user, Role requiredRole) {
        if (user.getRole() != requiredRole) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "You must be " + requiredRole + " to perform this action.");
        }
    }

    public static void requireAnyRole(User user, Role... allowedRoles) {
        for (Role role : allowedRoles) {
            if (user.getRole() == role) {
                return;
            }
        }
        throw new ApiException(HttpStatus.FORBIDDEN,
                "You don’t have permission for this action.");
    }

    public static User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
