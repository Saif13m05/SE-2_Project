package com.AuthService.demo.jwt;


public class AuthUser {
    private Integer userId;
    private String email;

    public AuthUser(Integer userId, String email) {
        this.userId = userId;
        this.email = email;
    }

    public Integer getUserId() { return userId; }
    public String getEmail() { return email; }
}
