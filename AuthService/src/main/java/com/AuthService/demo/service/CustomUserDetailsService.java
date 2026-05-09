package com.AuthService.demo.service;

import com.AuthService.demo.Entity.User;
import com.AuthService.demo.Repo.UserRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;



@Service
public class CustomUserDetailsService implements UserDetailsService {
	
	@Autowired
	UserRepo userRepo;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		// TODO Auto-generated method stub
		User user= userRepo.findByEmail(email);
		
		if(user == null) {
				throw new UsernameNotFoundException("User not found");
		}
		return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.emptyList() 
		);
		
	}

}
