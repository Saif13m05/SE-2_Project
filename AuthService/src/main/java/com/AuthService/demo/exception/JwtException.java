package com.AuthService.demo.exception;

public class JwtException extends RuntimeException {

    public JwtException(String message) {
        super(message);
    }
}
