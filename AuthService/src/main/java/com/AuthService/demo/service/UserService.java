package com.AuthService.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.AuthService.demo.DTO.UserDTO;
import com.AuthService.demo.Entity.Role;
import com.AuthService.demo.Entity.User;
import com.AuthService.demo.Helper.AuthHelper;
import com.AuthService.demo.Repo.RoleRepo;
import com.AuthService.demo.Repo.UserRepo;
import com.AuthService.demo.exception.ResourceNotFoundException;

import jakarta.servlet.http.HttpServletRequest;


@Service
public class UserService {
	
	@Autowired
	private UserRepo userRepo;
	
	@Autowired
	private RoleRepo roleRepo;
	
	@Autowired
	private AuthHelper authHelper;
	
	
	@Autowired
    private PasswordEncoder passwordEncoder;

	 public List<User> getAllUsers(HttpServletRequest request) {
		 authHelper.checkInternal(request);
		 authHelper.checkAdmin(request);
	        return userRepo.findAll();
	    }

	    public User getUserById(int id, HttpServletRequest request) {
	    	authHelper.checkInternal(request);
	    	authHelper.checkOwnerByIdOrAdmin(request, String.valueOf(id));

	        return userRepo.findById(id)
	                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
	    }

//	    public User getUserByEmail(String email, HttpServletRequest request) {
//	    	authHelper.checkInternal(request);
//	    	authHelper.checkOwnerOrAdmin(request, email);
//
//	        return userRepo.findByEmail(email);
//	    }
//
//	    public String updateByEmail(String email, UserDTO dto, HttpServletRequest request) {
//	    	authHelper.checkInternal(request);
//	    	authHelper.checkOwnerOrAdmin(request, email);
//
//	        User user = userRepo.findByEmail(email);
//
//	        user.setFirstName(dto.getFirstName());
//	        user.setLastName(dto.getLastName());
//	        user.setPassword(passwordEncoder.encode(dto.getPassword()));
//
//	        userRepo.save(user);
//
//	        return "User updated successfully";
//	    }

	    public int createUser(UserDTO dto, HttpServletRequest request) {
	    	authHelper.checkInternal(request);
//	    	authHelper.checkAdmin(request);

			if(userRepo.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email already exists");

            }
			
	        User user = new User();

	        user.setFirstName(dto.getFirstName());
	        user.setLastName(dto.getLastName());
	        user.setEmail(dto.getEmail());
	        user.setPassword(passwordEncoder.encode(dto.getPassword()));
	        
	        user.setPhone(dto.getPhone());

	        Role role = roleRepo.findById(dto.getRoleId())
	                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + dto.getRoleId()));

	        user.setRole(role);
	        userRepo.save(user);

	        return user.getId();
	    }

	    public String updateUser(int id, UserDTO dto, HttpServletRequest request) {
	    	authHelper.checkInternal(request);
	    	authHelper.checkOwnerByIdOrAdmin(request , String.valueOf(id));

	        User user = userRepo.findById(id)
	                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

	        user.setFirstName(dto.getFirstName());
	        user.setLastName(dto.getLastName());
	        user.setPassword(passwordEncoder.encode(dto.getPassword()));

	        userRepo.save(user);

	        return "User updated successfully";
	    }

	    public String deleteUser(int id, HttpServletRequest request) {
	    	authHelper.checkInternal(request);
	    	authHelper.checkAdmin(request);

	        if (!userRepo.existsById(id)) {
	            throw new ResourceNotFoundException("User not found with id: " + id);
	        }

	        userRepo.deleteById(id);
	        return "User deleted successfully";
	    }

}
	

