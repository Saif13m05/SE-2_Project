package com.academicservice.demo.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.academicservice.demo.DTOS.EnrollmentDTO;
import com.academicservice.demo.DTOS.events.EnrollmentEvent;
import com.academicservice.demo.Entities.Course;
import com.academicservice.demo.Entities.Enrollment;
import com.academicservice.demo.repos.CourseRepository;
import com.academicservice.demo.repos.EnrollmentRepo;



@Service
public class EnrollmentService {
	
	

	@Autowired
	EnrollmentRepo enrollmentRepo;
	
	@Autowired
	CourseRepository courseRepository;

	@Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

	public List<Enrollment> getAllEnrollments() {
		return enrollmentRepo.findAll();
	}
	
	public List<Enrollment> getStudentEnrollments( int id) {
		return enrollmentRepo.findByStudentId(id);
	}

	public List<Enrollment> getEnrollmentsByCourse(int id){
        return enrollmentRepo.findByCourseId(id);
    }

	@Transactional
	public List<Enrollment> syncEnrollments(EnrollmentDTO dto) {
		int studentId = dto.getStudentId();
		
		List<Enrollment> currentEnrollments = enrollmentRepo.findByStudentId(studentId);
		
		List<Integer> currentCourseIds = currentEnrollments.stream()
				.map(e -> e.getCourse().getId())
				.collect(Collectors.toList());

		if (dto.getCourseIds() == null || dto.getCourseIds().isEmpty()) {
			for (Enrollment existing : currentEnrollments) {
				enrollmentRepo.delete(existing);
				sendKafkaEvent(studentId, existing.getCourse().getId(), "DELETED");
			}
			sendKafkaEvent(studentId, 0, "ALL_ENROLLMENTS_DELETED");
			return new ArrayList<>(); 
		}

		
		for (Enrollment existing : currentEnrollments) {
			if (!dto.getCourseIds().contains(existing.getCourse().getId())) {
				enrollmentRepo.delete(existing);
				sendKafkaEvent(studentId, existing.getCourse().getId(), "DELETED");
			}
		}

		for (int newCourseId : dto.getCourseIds()) {
			if (!currentCourseIds.contains(newCourseId)) {
				Course course = courseRepository.findById(newCourseId)
						.orElseThrow(() -> new RuntimeException("Course not found"));
				
				Enrollment newEnrollment = new Enrollment();
				newEnrollment.setStudentId(studentId);
				newEnrollment.setCourse(course);
				enrollmentRepo.save(newEnrollment);
				
				sendKafkaEvent(studentId, newCourseId, "SUCCESS_ENROLLMENT");
			}
		}

		return enrollmentRepo.findByStudentId(studentId);
	}

    private void sendKafkaEvent(int studentId, int courseId, String status) {
        EnrollmentEvent event = new EnrollmentEvent();
		event.setStudentId(studentId);
		event.setCourseId(courseId);
		event.setStatus(status);
        kafkaTemplate.send("enrollment-topic", event);
    }
	
	@Transactional
    public void dropCourse(int studentId, int courseId) {
        
        enrollmentRepo.deleteByStudentIdAndCourse_Id(studentId, courseId);
        
        sendKafkaEvent(studentId, courseId, "DELETED");

        List<Enrollment> remaining = enrollmentRepo.findByStudentId(studentId);
        
        if (remaining.isEmpty()) {
            sendKafkaEvent(studentId, 0, "ALL_ENROLLMENTS_DELETED");
        }
    }
}
