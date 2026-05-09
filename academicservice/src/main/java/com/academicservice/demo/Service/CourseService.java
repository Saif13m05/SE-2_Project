package com.academicservice.demo.Service;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.academicservice.demo.DTOS.CourseDTO;
import com.academicservice.demo.Entities.Course;
import com.academicservice.demo.Entities.Day;
import com.academicservice.demo.Entities.Instructor;
import com.academicservice.demo.Entities.Lab;
import com.academicservice.demo.Exception.ResourceNotFoundException;
import com.academicservice.demo.repos.CourseRepository;
import com.academicservice.demo.repos.InstructorRepo;
import com.academicservice.demo.repos.LabRepo;

import jakarta.servlet.http.HttpServletRequest;



@Service
public class CourseService {

	  
	@Autowired
    CourseRepository courseRepo;
	
	@Autowired
	InstructorRepo instructorRepo;
	
	@Autowired
	LabRepo labRepo;

	@Autowired
	private AuthHelper authHelper;

    public List<Course> getCourses(HttpServletRequest request ) {
    	
    	 authHelper.checkInternal(request);
    	 authHelper.checkAdmin(request);
    	 
    	 return courseRepo.findAll();
    }
    

    public Course getCourseById(int id,HttpServletRequest request) {
    	authHelper.checkInternal(request);
   	 	authHelper.checkAdmin(request);
   	 
    	return courseRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }
    
    
    public List<Course> getCourseByInstructorId(int id,HttpServletRequest request) {
    	authHelper.checkInternal(request);
    	authHelper.checkAdminOrInstructor(request);
   	 
    	return courseRepo.findByInstructorInstructorId(id);
//    			.orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }
    
    

    public Course addCourse(CourseDTO dto , HttpServletRequest request) {
    	
    	authHelper.checkInternal(request);
   	 	authHelper.checkAdmin(request);
   	 
    	
        Course course = new Course();
        
        course.setCourseName(dto.getCourseName());
        course.setCourseCode(dto.getCourseCode());
        course.setDay(Day.valueOf(dto.getDay()));
        course.setStartTime(dto.getStartTime());
        course.setEndTime(dto.getEndTime());
        course.setIsDeleted(false);
        course.setGradeLevel(dto.getGradeLevel());

        Instructor instructor = instructorRepo.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
            course.setInstructor(instructor);

            // ✅ هات Lab/Class من DB
            Lab lab = labRepo.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            course.setLab(lab);
    	
        return courseRepo.save(course);
    }
    
    public Course updateCourse( int id, CourseDTO dto, HttpServletRequest request) {
    	
    	authHelper.checkInternal(request);
   	 	authHelper.checkAdmin(request);
   	 
    	
    	Course existingCourse = courseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        existingCourse.setCourseName(dto.getCourseName());
        existingCourse.setCourseCode(dto.getCourseCode());
        existingCourse.setDay(Day.valueOf(dto.getDay()));
        existingCourse.setStartTime(dto.getStartTime());
        existingCourse.setEndTime(dto.getEndTime());
        existingCourse.setIsDeleted(dto.getIsDeleted());
        existingCourse.setGradeLevel(dto.getGradeLevel());
        
        
        Instructor instructor = instructorRepo.findById(dto.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        existingCourse.setInstructor(instructor);

            // ✅ هات Lab/Class من DB
            Lab lab = labRepo.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
            existingCourse.setLab(lab);
    	
        return courseRepo.save(existingCourse);
    }
    
    public	void deleteCourse(int id, HttpServletRequest request) {
    	authHelper.checkInternal(request);
   	 	authHelper.checkAdmin(request);
    	
    	courseRepo.deleteById(id);
    }

    public List<Course> getCoursesByLevel(int level , HttpServletRequest request){

        authHelper.checkInternal(request);

        return courseRepo.getCoursesByGradeLevel(level);
    }


}
