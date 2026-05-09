package com.academicservice.demo.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.academicservice.demo.DTOS.LabDTO;
import com.academicservice.demo.Entities.Lab;
import com.academicservice.demo.Exception.ResourceNotFoundException;
import com.academicservice.demo.repos.LabRepo;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class LabService {

    @Autowired
    LabRepo labRepo;

    @Autowired
    AuthHelper authHelper;

    // FIX: removed checkAdmin — any authenticated internal user can read labs.
    // Role-based filtering (instructor sees only his courses' labs, student sees
    // only enrolled courses' labs) is done entirely in the frontend.
    public List<Lab> getLabs(HttpServletRequest request) {
        authHelper.checkInternal(request);
        return labRepo.findAll();
    }

    public Lab getLabById(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        return labRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lab not found"));
    }

    // Write operations remain admin-only
    public Lab addLab(LabDTO dto, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        Lab lab = new Lab();
        lab.setClassName(dto.getClassName());
        return labRepo.save(lab);
    }

    public Lab UpdateLab(int id, LabDTO dto, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        Lab existingLab = labRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Lab not found"));
        existingLab.setClassName(dto.getClassName());
        return labRepo.save(existingLab);
    }

    public void deleteLab(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        labRepo.deleteById(id);
    }
}