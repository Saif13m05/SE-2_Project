package com.AuthService.demo.Entity;


import java.time.LocalDate;

import org.hibernate.annotations.CreationTimestamp;
import jakarta.validation.constraints.*;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {	
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	
	@NotBlank
	private String firstName;
	@NotBlank
	private String lastName;

	private String phone;
	
	@NotBlank
	@Email
    @Column(nullable = false, unique = true)
	private String email;
	
	@Size(min = 8)
	private String password;
    
	@ManyToOne
	@JoinColumn(name = "role_id")
	private Role role;
	
	@CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDate createdAt;
	
	
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String emailString) {
		this.email = emailString;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public LocalDate getCreatedAt() {
        return createdAt;
    }
	
	
	
}
