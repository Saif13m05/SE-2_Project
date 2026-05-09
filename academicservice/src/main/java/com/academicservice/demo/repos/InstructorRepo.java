package com.academicservice.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academicservice.demo.Entities.Instructor;

public interface InstructorRepo extends JpaRepository<Instructor, Integer> {
	
}
