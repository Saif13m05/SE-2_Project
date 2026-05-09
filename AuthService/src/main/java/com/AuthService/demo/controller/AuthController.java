package com.AuthService.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.AuthService.demo.DTO.LoginDTO;
import com.AuthService.demo.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	@Autowired
	private AuthService authService;
	 
	 @PostMapping("/login")
	 public String login(@Valid @RequestBody LoginDTO request) {
	     return authService.login(request);
	 }
	 
	
}
