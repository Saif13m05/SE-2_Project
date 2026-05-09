package com.student_managment_service.student_management.repository;

import com.student_managment_service.student_management.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {

   // Student findByEmail(String email);
}