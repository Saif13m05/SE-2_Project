package com.student_managment_service.student_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.student_managment_service.student_management.model.Parent;

public interface ParentRepository extends JpaRepository<Parent, Integer> {
}
