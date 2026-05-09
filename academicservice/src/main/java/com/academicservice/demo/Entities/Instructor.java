package com.academicservice.demo.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "instructor")
public class Instructor {

	@Id
    @Column(name = "instructor_id")
    private int instructorId;

    private String firstName;
    private String lastName;


    public int getInstructorId() {
        return instructorId;
    }

    public void setInstructorId(int instructorId) {
        this.instructorId = instructorId;
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

    
}