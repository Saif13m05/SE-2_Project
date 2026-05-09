package com.student_managment_service.student_management.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.*;

public class CreatePerantRequest {

	@NotBlank
	private String firstName;

	@NotBlank
	private String lastName;

	private String phone;

	@NotBlank
	@Email
	private String email;

	@Size(min = 8)
	private String password;

	private int roleId;
	
	private int perantId;
	
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
	public int getRoleId() {
		return roleId;
	}
	public void setRoleId(int roleId) {
		this.roleId = roleId;
	}
	public int getPerantId() {
		return perantId;
	}
	public void setPerantId(int perantId) {
		this.perantId = perantId;
	}
}
