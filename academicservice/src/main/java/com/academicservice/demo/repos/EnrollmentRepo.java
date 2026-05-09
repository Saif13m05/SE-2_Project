package com.academicservice.demo.repos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.academicservice.demo.Entities.Enrollment;

import jakarta.transaction.Transactional;

public interface EnrollmentRepo extends JpaRepository<Enrollment, Integer> {

	List<Enrollment> findByStudentId(int studentId);

	List<Enrollment> findByCourseId(int courseId);
	
	@Transactional
	void deleteByStudentIdAndCourse_Id(int studentId, int courseId);
}
