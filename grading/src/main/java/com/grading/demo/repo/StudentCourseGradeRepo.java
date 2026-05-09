package com.grading.demo.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grading.demo.model.StudentCourseGrade;

public interface StudentCourseGradeRepo extends JpaRepository<StudentCourseGrade, Integer> {

    List<StudentCourseGrade> findByStudentId(int studentId);
    
    List<StudentCourseGrade> findByCourseId(int courseId);

    Optional<StudentCourseGrade> findByStudentIdAndCourseId(int studentId, int courseId);

    long countByStudentId(int studentId);
}