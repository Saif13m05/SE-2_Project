package com.student_managment_service.student_management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.student_managment_service.student_management.dto.CreatePerantRequest;
import com.student_managment_service.student_management.dto.UserDTO;
import com.student_managment_service.student_management.model.Parent;
import com.student_managment_service.student_management.repository.ParentRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ParentService {

    @Autowired
    ParentRepository parentRepository;

    @Autowired
    AuthHelper authHelper;
    
    @Autowired
    UserClient userClient;
    
    // CREATE PARENT
    public Parent createParent(CreatePerantRequest parentRequest, HttpServletRequest request) {
        // parent.setCreatedAt(LocalDateTime.now());
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        
        UserDTO userDTO=new UserDTO();
        
        userDTO.setFirstName(parentRequest.getFirstName());
        userDTO.setLastName(parentRequest.getLastName());
        userDTO.setEmail(parentRequest.getEmail());
        userDTO.setPassword(parentRequest.getPassword());
        userDTO.setRoleId(parentRequest.getRoleId());
        userDTO.setPhone(parentRequest.getPhone());
        
//        String token = request.getHeader("Authorization");
        
        int userId = userClient.createUser(
                userDTO,
//                token,
                "my-secret-key"
            );
        
        Parent parent=new Parent();
        parent.setId(userId);
        parent.setFirstName(parentRequest.getFirstName());
        parent.setLastName(parentRequest.getLastName());
        return parentRepository.save(parent);
    }

    // GET ALL PARENTS
    public List<Parent> getAllParents(HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        return parentRepository.findAll();
    }

    // GET BY ID
    public Parent getParentById(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkOwnerByIdOrAdmin(request , String.valueOf(id));
        return parentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Parent not found with id: " + id));
    }

    // DELETE
    public void deleteParent(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        Parent parent = getParentById(id, request);
        parentRepository.delete(parent);
    }

    // UPDATE
    // public Parent updateParent(Long id, Parent updatedParent, HttpServletRequest request) {
    //     Parent parent = getParentById(id);

    //     // parent.setName(updatedParent.getName());
    //     // parent.setPhone(updatedParent.getPhone());

    //     return parentRepository.save(parent);
    // }
}