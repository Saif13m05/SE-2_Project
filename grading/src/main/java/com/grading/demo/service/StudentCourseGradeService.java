package com.grading.demo.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grading.demo.model.StudentCourseGrade;
import com.grading.demo.repo.StudentCourseGradeRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentCourseGradeService {

	@Autowired
    StudentCourseGradeRepo repo;

    // Add course
    public StudentCourseGrade addCourse(int studentId, int courseId) {

        long count = repo.countByStudentId(studentId);

        if (count >= 7) {
            throw new RuntimeException("Max 7 courses allowed");
        }

        StudentCourseGrade scg = new StudentCourseGrade();
        scg.setStudentId(studentId);
        scg.setCourseId(courseId);

        return repo.save(scg);
    }

    public void removeGradeRecord(int studentId, int courseId) {
        repo.findByStudentIdAndCourseId(studentId, courseId)
            .ifPresent(record -> repo.delete(record));
    }

    // Assign grade
    public StudentCourseGrade assignGrade(int studentId, int courseId, Double grade) {

        StudentCourseGrade scg = repo
                .findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        scg.setGrade(grade);

        return repo.save(scg);
    }

    // Get all grades
    public List<StudentCourseGrade> getGrades(int studentId) {

        long count = repo.countByStudentId(studentId);

        if (count < 5) {
            throw new RuntimeException("Minimum 5 courses required");
        }

        return repo.findByStudentId(studentId);
    }
    
    public List<StudentCourseGrade> getCourseGrades(int courseId){
    	return repo.findByCourseId(courseId);
    }
}




