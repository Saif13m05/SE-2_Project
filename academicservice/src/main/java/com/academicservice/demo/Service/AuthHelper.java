package com.academicservice.demo.Service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class AuthHelper {

    private static final String SECRET = "my-secret-key";

    public void checkInternal(HttpServletRequest request) {
        String secret = request.getHeader("X-Internal-Secret");
        if (!SECRET.equals(secret)) {
            throw new RuntimeException("Forbidden: direct access denied");
        }
    }

    public void checkAdmin(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (!"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Forbidden: Admin only");
        }
    }
    
    public void checkInstructor(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (!"INSTRUCTOR".equalsIgnoreCase(role) && !"INSTRACTOR".equalsIgnoreCase(role)) {
            throw new RuntimeException("Forbidden: Instructor only");
        }
    }
    
    public void checkAdminOrInstructor(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        if (!"INSTRUCTOR".equalsIgnoreCase(role)&&!"INSTRACTOR".equalsIgnoreCase(role)&&!"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Forbidden: Admin or INSTRUCTOR only");
        }
    }

    public void checkOwnerOrAdmin(HttpServletRequest request, String email) {
        String role = request.getHeader("X-User-Role");
        String currentUser = request.getHeader("X-User-Email");

        if (!email.equals(currentUser) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Forbidden: Not allowed");
        }
    }
}