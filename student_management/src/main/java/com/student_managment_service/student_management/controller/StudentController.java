package com.student_managment_service.student_management.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.student_managment_service.student_management.dto.CreateStudentRequest;
import com.student_managment_service.student_management.dto.StudentDTO;
import com.student_managment_service.student_management.dto.UpdateStudentRequest;
import com.student_managment_service.student_management.mapper.StudentMapper;
import com.student_managment_service.student_management.model.Student;
import com.student_managment_service.student_management.service.StudentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/student")
public class StudentController {
	
	
	@Autowired
    StudentService service;

    @PostMapping("/Add")
    public Student create(@Valid @RequestBody CreateStudentRequest student, HttpServletRequest request) {
        return service.createStudent(student, request);
    }

    @GetMapping("/GetAll")
    public List<Student> getAll(HttpServletRequest request) {
        return service.getAllStudents(request);
    }

    @GetMapping("/GetById/{id}")
    public StudentDTO getById(@PathVariable int id, HttpServletRequest request) {
        Student student = service.getStudentById(id, request);
        return StudentMapper.toDTO(student);
    }

    @PutMapping("/update/{id}")
    public Student update(@Valid @PathVariable int id,
                          @RequestBody UpdateStudentRequest student, HttpServletRequest request) {
        return service.updateStudent(id, student, request);
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable int id, HttpServletRequest request) {
        service.deleteStudent(id, request);
    }

    @PostMapping("/mapStudentParent/{studentId}/parents/{parentId}")
    public String linkParent(@Valid @PathVariable int studentId,
                             @PathVariable int parentId,
                            HttpServletRequest request) {
        return service.addParentToStudent(studentId, parentId, request);
    }
}
