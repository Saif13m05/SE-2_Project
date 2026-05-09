package com.academicservice.demo.Controller;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;

import com.academicservice.demo.DTOS.CreateInstructorRequest;
import com.academicservice.demo.Entities.Instructor;
import com.academicservice.demo.Service.InstructorService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;






@RestController
@RequestMapping("/instructor")
public class InstructorRestController {
		
	@Autowired
	public InstructorService instructorService;
	
	
	@GetMapping("/GetAll")
	public List<Instructor> getInstructors(HttpServletRequest request) {
		return instructorService.getInstructors(request);
	}
	
	@GetMapping("/GetById/{id}")
	public Instructor getInstructorById(@PathVariable("id")int id , HttpServletRequest request) {
		return instructorService.getInstructorById(id,request);
	}
	
	@PostMapping("/Add")
	public Instructor addInstructor(@Valid @RequestBody CreateInstructorRequest dto , HttpServletRequest request) {
		return instructorService.addInstructor(dto,request);
	}
	
	
	@DeleteMapping("/delete/{id}")	
	public void deleteInstructor(@PathVariable("id") int id, HttpServletRequest request) {
		instructorService.deleteInstructor(id, request);
	}
}
