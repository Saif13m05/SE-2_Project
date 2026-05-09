package com.AuthService.demo.Helper;

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

    public void checkOwnerByIdOrAdmin(HttpServletRequest request, String id) {
        String role = request.getHeader("X-User-Role");
        String currentUser = request.getHeader("X-User-Id");

        if (!id.equals(currentUser) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new RuntimeException("Forbidden: Not allowed");
        }
    }
    
    
}