package com.AuthService.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.AuthService.demo.DTO.UserDTO;
import com.AuthService.demo.Entity.User;
import com.AuthService.demo.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class UserRestController {

    @Autowired
    private UserService userService;

    @GetMapping("/AllUsers")
    public List<User> GetUsers(HttpServletRequest request) {
        return userService.getAllUsers(request);
    }

    @GetMapping("/GetById/{id}")
    public User getUserById(@PathVariable("id") int id, HttpServletRequest request) {
        return userService.getUserById(id, request);
    }


    @PostMapping("/create")
    public int createUser(@Valid @RequestBody UserDTO dto,
                             HttpServletRequest request) {
        return userService.createUser(dto, request);
    }

    @PutMapping("/UpdateById/{id}")
    public String updateUser(@Valid @PathVariable("id") int id,
                             @RequestBody UserDTO dto,
                             HttpServletRequest request) {
        return userService.updateUser(id, dto, request);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteUser(@PathVariable("id") int id,
                             HttpServletRequest request) {
        return userService.deleteUser(id, request);
    }
}