package com.academicservice.demo.DTOS.events;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EnrollmentEvent {
    private int studentId;
    private int courseId;
    private String status;

    public int getStudentId() {
		return studentId;
	}
	public void setStudentId(int studentId) {
		this.studentId = studentId;
	}
    
	public int getCourseId() {
		return courseId;
	}
	public void setCourseId(int courseId) {
		this.courseId = courseId;
	}

	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
}