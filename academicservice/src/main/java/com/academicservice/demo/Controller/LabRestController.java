package com.academicservice.demo.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import com.academicservice.demo.DTOS.LabDTO;
import com.academicservice.demo.Entities.Lab;
import com.academicservice.demo.Service.LabService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;






@RestController
@RequestMapping("/lab")
public class LabRestController {
	
	@Autowired
	LabService labService;
	
	@GetMapping("/labs")
	public List<Lab> getLabs(HttpServletRequest request) {
		return labService.getLabs(request);
	}
	
	
	@GetMapping("/labs/{id}")
	public Lab getLabById(@PathVariable("id")int id, HttpServletRequest request) {
		return labService.getLabById(id, request);
	}
	
	@PostMapping("/add")
	public Lab addLab(@RequestBody LabDTO dto , HttpServletRequest request) {
		
		
		
		return labService.addLab(dto,request);
	}
	
	@PutMapping("/update/{id}")
	public Lab UpdateLab(@PathVariable("id") int id, @RequestBody LabDTO dto ,
			HttpServletRequest request) {
		
		return labService.UpdateLab(id,dto,request);
	}
	
	
	
	@DeleteMapping("/delete/{id}")
	public void deleteLab(@PathVariable("id") int id , HttpServletRequest request) {
		labService.deleteLab(id,request);
	}
	
	
	
}
