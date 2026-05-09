package com.academicservice.demo.repos;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academicservice.demo.Entities.Course;

import java.util.List;


public interface CourseRepository extends JpaRepository<Course, Integer> {

    List<Course> getCoursesByGradeLevel(int gradeLevel);
    
    List<Course> findByInstructorInstructorId(int instructorId);
}
