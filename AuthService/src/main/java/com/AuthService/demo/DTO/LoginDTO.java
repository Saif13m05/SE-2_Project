package com.AuthService.demo.DTO;

import jakarta.validation.constraints.*;

public class LoginDTO {

	@NotBlank
	@Email
    private String email;

	@Size(min = 8)
    private String password;
    
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}

    
}