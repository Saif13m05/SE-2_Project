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
		
		// 1. جلب التسجيلات الحالية من الداتابيز
		List<Enrollment> currentEnrollments = enrollmentRepo.findByStudentId(studentId);
		
		List<Integer> currentCourseIds = currentEnrollments.stream()
				.map(e -> e.getCourse().getId())
				.collect(Collectors.toList());


		
		// 2. حالة حذف كل المواد
		if (dto.getCourseIds() == null || dto.getCourseIds().isEmpty()) {
			for (Enrollment existing : currentEnrollments) {
				enrollmentRepo.delete(existing);
				sendKafkaEvent(studentId, existing.getCourse().getId(), "DELETED");
			}
			sendKafkaEvent(studentId, 0, "ALL_ENROLLMENTS_DELETED");
			return new ArrayList<>(); // نرجع لستة فاضية لأننا مسحنا كل حاجة
		}

		// 3. معالجة الحذف
		for (Enrollment existing : currentEnrollments) {
			if (!dto.getCourseIds().contains(existing.getCourse().getId())) {
				enrollmentRepo.delete(existing);
				sendKafkaEvent(studentId, existing.getCourse().getId(), "DELETED");
			}
		}

		// 4. معالجة الإضافة
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

		// 5. نرجع القائمة النهائية المحدثة من الداتابيز بعد كل التعديلات
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
        // 1. تنفيذ عملية الحذف
        enrollmentRepo.deleteByStudentIdAndCourse_Id(studentId, courseId);
        
        // 2. إرسال حدث حذف المادة العادي
        sendKafkaEvent(studentId, courseId, "DELETED");

        // 3. التشيك السحري: هل الطالب لسه عنده مواد تانية؟
        List<Enrollment> remaining = enrollmentRepo.findByStudentId(studentId);
        
        if (remaining.isEmpty()) {
            // لو مفيش مواد خالص، نبعت الرسالة الخاصة بتغيير حالة الطالب
            sendKafkaEvent(studentId, 0, "ALL_ENROLLMENTS_DELETED");
            // System.out.println("⚠️ تنبيه: الطالب مسح آخر مادة، تم إبلاغ خدمة الطلاب.");
        }
    }
}
