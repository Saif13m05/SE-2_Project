package com.academicservice.demo.Controller;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.academicservice.demo.DTOS.CourseDTO;
import com.academicservice.demo.Entities.Course;
import com.academicservice.demo.Service.CourseService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/course")
public class CourseRestController {

  
	@Autowired
    CourseService courseService;

    @GetMapping("/GetAll")
    public List<Course> getCourses(HttpServletRequest request) {
        return courseService.getCourses( request);
    }

    @GetMapping("/GetAll/{level}")
    public List<Course> getCoursesByLevel(@PathVariable("level") int level ,HttpServletRequest request) {
        return courseService.getCoursesByLevel(level , request);
    }
      
    @GetMapping("/GetById/{id}")
    public Course getCourseById(@PathVariable("id") int id , HttpServletRequest request) {
    	return courseService.getCourseById(id,request);
    }
    
    
    @GetMapping("/GetByInstructorId/{id}")
    public List<Course> getCourseByInstructorId(@PathVariable("id") int id , HttpServletRequest request) {
    	return courseService.getCourseByInstructorId(id,request);
    }
        
    @PostMapping("/add")
    public Course addCourse(@RequestBody CourseDTO dto , HttpServletRequest request) {
        return courseService.addCourse(dto,request);
    }
    
    @PutMapping("/update/{id}")
    public Course updateCourse(@PathVariable("id") int id, 
    		@RequestBody CourseDTO dto , HttpServletRequest request) {
    	
        return courseService.updateCourse(id, dto , request);
    }
    
    @DeleteMapping("/delete/{id}")
    public	void deleteCourse(@PathVariable("id") int id , HttpServletRequest request) {
    	courseService.deleteCourse(id, request);
    }
    
}

