package com.student_managment_service.student_management.dto;

import java.time.LocalDate;

public class UpdateStudentRequest {
	
	private String firstName;
    private String lastName;
    private Integer gradeLevel;
    private int term;
    private LocalDate dateOfBirth;
    
    
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
   public Integer getGradeLevel() {
	return gradeLevel;
   }
   public void setGradeLevel(Integer gradeLevel) {
	this.gradeLevel = gradeLevel;
   }
   public int getTerm() {
	return term;
   }
   public void setTerm(int term) {
	this.term = term;
   }
   public LocalDate getDateOfBirth() {
	return dateOfBirth;
   }
   public void setDateOfBirth(LocalDate dateOfBirth) {
	this.dateOfBirth = dateOfBirth;
   }
}