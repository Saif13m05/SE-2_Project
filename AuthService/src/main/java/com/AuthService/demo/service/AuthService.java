package com.AuthService.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.AuthService.demo.DTO.LoginDTO;
import com.AuthService.demo.Entity.User;
import com.AuthService.demo.Repo.UserRepo;
import com.AuthService.demo.exception.AuthException;

import com.AuthService.demo.jwt.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepo userRepo;


    public String login(LoginDTO request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new AuthException("Invalid email or password");
        }

        User user = userRepo.findByEmail(request.getEmail());
        if (user == null) {
            throw new AuthException("Invalid email or password");
        }

        return jwtUtil.generateToken(user);
    }

}