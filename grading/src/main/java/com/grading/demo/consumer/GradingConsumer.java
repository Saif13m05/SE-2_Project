package com.grading.demo.consumer;

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
        int studentId = event.getStudentId();
        int courseId = event.getCourseId();

        if ("SUCCESS_ENROLLMENT".equals(event.getStatus())) {
            gradingService.addCourse(studentId, courseId);
        } 
        else if ("DELETED".equals(event.getStatus())) {
            // ميثود جديدة قمنا بإضافتها لمسح السجل
            gradingService.removeGradeRecord(studentId, courseId);
        }
    }
}