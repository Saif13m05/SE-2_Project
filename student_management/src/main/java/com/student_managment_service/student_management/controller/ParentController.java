package com.student_managment_service.student_management.controller;

import com.student_managment_service.student_management.dto.CreatePerantRequest;
import com.student_managment_service.student_management.dto.ParentDTO;
import com.student_managment_service.student_management.mapper.ParentMapper;
import com.student_managment_service.student_management.model.Parent;
import com.student_managment_service.student_management.service.ParentService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parents")
public class ParentController {
	
	
	@Autowired
    ParentService parentService;

    // CREATE
    @PostMapping("/Add")
    public Parent create(@Valid @RequestBody CreatePerantRequest parent, HttpServletRequest request) {
        return parentService.createParent(parent, request);
    }

    // GET ALL
    @GetMapping("/GetAll")
    public List<Parent> getAll(HttpServletRequest request) {
        return parentService.getAllParents(request);
    }

    // GET BY ID
    @GetMapping("/GetById/{id}")
    public ParentDTO getById(@PathVariable int id, HttpServletRequest request) {
        Parent parent = parentService.getParentById(id, request);
        return ParentMapper.toDTO(parent);
    }

    // DELETE
    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable int id, HttpServletRequest request) {
        parentService.deleteParent(id, request);
    }

    // UPDATE
    // @PutMapping("/{id}")
    // public Parent update(@PathVariable Long id,
    //                      @RequestBody Parent parent) {
    //     return parentService.updateParent(id, parent);
    // }
}