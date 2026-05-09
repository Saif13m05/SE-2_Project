package com.academicservice.demo.Service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.academicservice.demo.DTOS.CreateInstructorRequest;
import com.academicservice.demo.DTOS.UserDTO;
import com.academicservice.demo.Entities.Course;
import com.academicservice.demo.Entities.Instructor;
import com.academicservice.demo.Exception.ResourceNotFoundException;
import com.academicservice.demo.repos.CourseRepository;
import com.academicservice.demo.repos.InstructorRepo;

import feign.FeignException;
import jakarta.servlet.http.HttpServletRequest;



@Service
public class InstructorService {
	@Autowired
	InstructorRepo instructorRepo;
	
	@Autowired
	AuthHelper authHelper;

	@Autowired
    CourseRepository courseRepo;
		
	@Autowired UserClient userClient;
	public List<Instructor> getInstructors(HttpServletRequest request) {
		authHelper.checkInternal(request);
		authHelper.checkAdminOrInstructor(request);
		return instructorRepo.findAll();
	}
	
	public Instructor getInstructorById(int id , HttpServletRequest request) {
		authHelper.checkInternal(request);
		authHelper.checkAdmin(request);
		return instructorRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Instructor not found with id: " + id));
	}
	
	public Instructor addInstructor( CreateInstructorRequest instructorRequest , HttpServletRequest request) {
		
		authHelper.checkInternal(request);
		authHelper.checkAdmin(request);
		UserDTO userDTO=new UserDTO();
        
        userDTO.setFirstName(instructorRequest.getFirstName());
        userDTO.setLastName(instructorRequest.getLastName());
        userDTO.setEmail(instructorRequest.getEmail());
        userDTO.setPassword(instructorRequest.getPassword());
        userDTO.setRoleId(instructorRequest.getRoleId());
        userDTO.setPhone(instructorRequest.getPhone());
        
        int userId ;

        try {

            userId= userClient.createUser(
                    userDTO,
                    "my-secret-key"
                );

        } catch (FeignException e) {

            throw new RuntimeException("Email already exists");
        }
        
        
		Instructor instructor=new Instructor();
		instructor.setInstructorId(userId);	
		instructor.setFirstName(instructorRequest.getFirstName());
		instructor.setLastName(instructorRequest.getLastName());
		return instructorRepo.save(instructor);
	}
	
	
	public void deleteInstructor( int id , HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);

         Instructor instructor = instructorRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

         List<Course> courses = courseRepo.findByInstructorInstructorId(instructor.getInstructorId());
         for (Course c : courses) {
                c.setInstructor(null);
            }
         courseRepo.saveAll(courses);

        instructorRepo.delete(instructor);
    }
}
