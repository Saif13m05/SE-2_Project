package com.grading.demo.service;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.grading.demo.dto.AddCourseDto;
import com.grading.demo.dto.AssignGradeDto;
import com.grading.demo.model.StudentCourseGrade;
import com.grading.demo.repo.StudentCourseGradeRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentCourseGradeService {

	@Autowired
    StudentCourseGradeRepo repo;

    // Add course
    public StudentCourseGrade addCourse(AddCourseDto dto) {

        long count = repo.countByStudentId(dto.studentId);

        if (count >= 7) {
            throw new RuntimeException("Max 7 courses allowed");
        }

        StudentCourseGrade scg = new StudentCourseGrade();
        scg.setStudentId(dto.studentId);
        scg.setCourseId(dto.courseId);

        return repo.save(scg);
    }

    public void removeGradeRecord(AddCourseDto dto) {
        repo.findByStudentIdAndCourseId(dto.studentId, dto.courseId)
            .ifPresent(record -> repo.delete(record));
    }

    // Assign grade
    public StudentCourseGrade assignGrade(AssignGradeDto dto) {

        StudentCourseGrade scg = repo
                .findByStudentIdAndCourseId(dto.studentId, dto.courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        scg.setGrade(dto.grade);

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




