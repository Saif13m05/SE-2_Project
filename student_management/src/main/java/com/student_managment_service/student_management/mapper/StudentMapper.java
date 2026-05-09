package com.student_managment_service.student_management.mapper;

import java.util.stream.Collectors;

import com.student_managment_service.student_management.dto.ParentDTO;
import com.student_managment_service.student_management.dto.StudentDTO;
import com.student_managment_service.student_management.model.Student;

public class StudentMapper {
    public static StudentDTO toDTO(Student student) {

        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
         dto.setFirstName(student.getFirstName());
         dto.setLastName(student.getLastName());
        dto.setGradeLevel(student.getGradeLevel());

        if (student.getParents() != null) {
            dto.setParents(
                    student.getParents().stream().map(parent -> {
                        ParentDTO p = new ParentDTO();
                        p.setId(parent.getId());
                         p.setFirstName(parent.getFirstName());
                         p.setLastName(parent.getLastName());
                        // p.setPhone(parent.getPhone());
                        return p;
                    }).collect(Collectors.toList())
            );
        }

        return dto;
    }
}
