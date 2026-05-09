package com.AuthService.demo.Repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.AuthService.demo.Entity.User;

public interface UserRepo extends JpaRepository<User, Integer> {
	
	User findByEmail(String email);
	boolean existsByEmail(String email);
}
