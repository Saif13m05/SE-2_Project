package com.academicservice.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academicservice.demo.Entities.Lab;

public interface LabRepo extends JpaRepository<Lab, Integer> {
	
}
