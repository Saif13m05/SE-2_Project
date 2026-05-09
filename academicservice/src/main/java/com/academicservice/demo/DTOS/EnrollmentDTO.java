package com.academicservice.demo.DTOS;

import java.util.List;

public class EnrollmentDTO {
	
	private int studentId;
    private List<Integer> courseIds;
    
	public int getStudentId() {
		return studentId;
	}
	public void setStudentId(int studentId) {
		this.studentId = studentId;
	}
	
	public List<Integer> getCourseIds() {
		return courseIds;
	}
	public void setCourseIds(List<Integer> courseIds) {
		this.courseIds = courseIds;
	}

}
