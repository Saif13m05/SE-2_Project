package com.academicservice.demo.Entities;

import java.sql.Time;
import jakarta.persistence.*;

@Entity
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    @Column(name = "course_name")
    private String courseName;
    
    @Column(name = "course_code")
    private String courseCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_day")
    private Day day;

    @Column(name = "startTime")
    private Time startTime;

    @Column(name = "endTime")
    private Time endTime;

    @Column(name = "isDeleted")
    private Boolean isDeleted;

    private Integer gradeLevel;

    @ManyToOne
    @JoinColumn(name = "instructor_id") 
    private Instructor instructor;

   
    @ManyToOne
    @JoinColumn(name ="class_id")
    private Lab lab;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public Day getDay() {
        return day;
    }

    public void setDay(Day day) {
        this.day = day;
    }

    public Time getStartTime() {
        return startTime;
    }

    public void setStartTime(Time startTime) {
        this.startTime = startTime;
    }

    public Time getEndTime() {
        return endTime;
    }

    public void setEndTime(Time endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Instructor getInstructor() {
        return instructor;
    }

    public void setInstructor(Instructor instructor) {
        this.instructor = instructor;
    }

	public String getCourseCode() {
		return courseCode;
	}

	public void setCourseCode(String courseNameString) {
		this.courseCode = courseNameString;
	}

	public Lab getLab() {
		return lab;
	}

	public void setLab(Lab class1) {
		this.lab = class1;
	}
}