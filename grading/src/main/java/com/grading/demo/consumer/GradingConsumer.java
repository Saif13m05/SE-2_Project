package com.grading.demo.consumer;

import com.grading.demo.dto.AddCourseDto;
import com.grading.demo.dto.events.EnrollmentEvent;
import com.grading.demo.service.StudentCourseGradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class GradingConsumer {

    @Autowired
    private StudentCourseGradeService gradingService;
    
    
    @KafkaListener(topics = "enrollment-topic", groupId = "grading-group")
    public void consume(EnrollmentEvent event) {
    	
    	AddCourseDto dto= new AddCourseDto();
        dto.studentId = event.getStudentId();
        dto.courseId = event.getCourseId();

        if ("SUCCESS_ENROLLMENT".equals(event.getStatus())) {
            gradingService.addCourse(dto);
        } 
        else if ("DELETED".equals(event.getStatus())) {
            gradingService.removeGradeRecord(dto);
        }
    }
}