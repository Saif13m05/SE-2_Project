package com.student_managment_service.student_management.consumer;

import com.student_managment_service.student_management.dto.events.EnrollmentEvent;
import com.student_managment_service.student_management.service.StudentService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class EnrollmentConsumer {

    @Autowired
    private StudentService studentService;

    @KafkaListener(topics = "enrollment-topic", groupId = "school-group")
    public void consume(EnrollmentEvent event) {
        int studentId = Math.toIntExact(event.getStudentId());

        switch (event.getStatus()) {
            case "SUCCESS_ENROLLMENT":
                studentService.updateStudentEnrollmentStatus(studentId, true);
                break;
                
            case "ALL_ENROLLMENTS_DELETED":
                studentService.updateStudentEnrollmentStatus(studentId, false);
                break;
        }
    }
}