package com.student_managment_service.student_management.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.student_managment_service.student_management.dto.CreateStudentRequest;
import com.student_managment_service.student_management.dto.UpdateStudentRequest;
import com.student_managment_service.student_management.dto.UserDTO;
import com.student_managment_service.student_management.model.Parent;
import com.student_managment_service.student_management.model.Student;
import com.student_managment_service.student_management.repository.ParentRepository;
import com.student_managment_service.student_management.repository.StudentRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private AuthHelper authHelper;

    @Autowired
    private UserClient userClient;
    
    //create
    public Student createStudent(CreateStudentRequest studentRequest, HttpServletRequest request) {
        // student.setCreatedAt(LocalDateTime.now());
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);
        
        UserDTO userDTO=new UserDTO();
        
        userDTO.setFirstName(studentRequest.getFirstName());
        userDTO.setLastName(studentRequest.getLastName());
        userDTO.setEmail(studentRequest.getEmail());
        userDTO.setPassword(studentRequest.getPassword());
        userDTO.setRoleId(studentRequest.getRoleId());
        userDTO.setPhone(studentRequest.getPhone());
        
//        String token = request.getHeader("Authorization");
        
        int userId = userClient.createUser(
                userDTO,
//                token,
                "my-secret-key"
            );
        
        Student student = new Student();
        student.setId(userId);
        student.setFirstName(studentRequest.getFirstName());
        student.setLastName(studentRequest.getLastName());
        student.setDateOfBirth(studentRequest.getDateOfBirth());
        student.setGradeLevel(studentRequest.getGradeLevel());
        student.setTerm(studentRequest.getTerm());
        student.setEnrolled(false);
        return studentRepository.save(student);
    }

    //getall
    public List<Student> getAllStudents(HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdminOrInstructor(request);
        return studentRepository.findAll();
    }

    //getbyid
    public Student getStudentById(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkOwnerByIdOrAdmin(request , String.valueOf(id));
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // Kafka
    public void updateStudentEnrollmentStatus(int id, boolean status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        student.setEnrolled(status);
        studentRepository.save(student);
    }

    //Update
    public Student updateStudent(int id, UpdateStudentRequest updatedStudent, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdminOrStudent(request);

        Student student = getStudentById(id, request);

        student.setFirstName(updatedStudent.getFirstName());
        student.setLastName(updatedStudent.getLastName());
        student.setTerm(updatedStudent.getTerm());
        student.setGradeLevel(updatedStudent.getGradeLevel());
        student.setDateOfBirth(updatedStudent.getDateOfBirth());

        return studentRepository.save(student);
    }

    //delete
    public void deleteStudent(int id, HttpServletRequest request) {
        authHelper.checkInternal(request);
        authHelper.checkAdmin(request);

        studentRepository.deleteById(id);
    }

    //link
    public String addParentToStudent(int studentId, int parentId,HttpServletRequest request) {

        Student student = getStudentById(studentId, request);

        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found with id: " + parentId));

        // avoid duplicates
        if (!student.getParents().contains(parent)) {
            student.getParents().add(parent);
        }

        studentRepository.save(student);

        return "Parent linked successfully";
    }

}
