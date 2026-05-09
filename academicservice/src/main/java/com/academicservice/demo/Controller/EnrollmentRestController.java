package com.academicservice.demo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.academicservice.demo.DTOS.EnrollmentDTO;
import com.academicservice.demo.Entities.Enrollment;
import com.academicservice.demo.Service.EnrollmentService;

import org.springframework.web.bind.annotation.*;




@RestController
@RequestMapping("/enrollment")
public class EnrollmentRestController {
	
	@Autowired
	EnrollmentService enrollmentService;
	
	@GetMapping("/GetAll")
	public List<Enrollment> getAllEnrollments() {
		return enrollmentService.getAllEnrollments();
	}
	
	@GetMapping("/GetByStudentId/{id}")
	public List<Enrollment> getStudentEnrollments(@PathVariable("id") int id) {
		return enrollmentService.getStudentEnrollments(id);
	}
	
	@GetMapping("/GetByCourseId/{id}")
	public List<Enrollment> getEnrollmentsByCourseId(@PathVariable("id") int id) {
		return enrollmentService.getEnrollmentsByCourse(id);
	}
	
	
	@PostMapping("/Save")
	public List<Enrollment> addEnrollment(@RequestBody EnrollmentDTO dto) {		
	
		return enrollmentService.syncEnrollments(dto);
	}
	
	@DeleteMapping("/delete/students/{studentId}/courses/{courseId}")
	public void dropCourse(@PathVariable ("studentId") int studentId,
	                       @PathVariable("courseId") int courseId) {

		enrollmentService.dropCourse(studentId, courseId);
	}
	
	
	
}
