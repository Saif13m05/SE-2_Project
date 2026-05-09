package com.grading.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.grading.demo.dto.AddCourseDto;
import com.grading.demo.dto.AssignGradeDto;
import com.grading.demo.model.StudentCourseGrade;
import com.grading.demo.service.StudentCourseGradeService;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/grades")

public class StudentCourseGradeController {

	@Autowired
    StudentCourseGradeService service;


    @PostMapping("/add-course")
    public StudentCourseGrade addCourse(@RequestBody AddCourseDto request) {
        return service.addCourse(request);
    }

    @PutMapping("/assign-grade")
    public StudentCourseGrade assignGrade(@Valid @RequestBody AssignGradeDto request) {
        return service.assignGrade(
        		request
        );
    }

    @GetMapping("/GetGrades/{studentId}")
    public List<StudentCourseGrade> getGrades(@PathVariable int studentId) {
        return service.getGrades(studentId);
    }
    
    @GetMapping("/GetCourseGrade/{courseId}")
    public List<StudentCourseGrade> getCourseGrades(@PathVariable int courseId){
    	return service.getCourseGrades(courseId);
    }
}