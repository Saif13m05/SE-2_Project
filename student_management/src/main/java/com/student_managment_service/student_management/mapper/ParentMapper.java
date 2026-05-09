package com.student_managment_service.student_management.mapper;

import java.util.stream.Collectors;

import com.student_managment_service.student_management.dto.ParentDTO;
import com.student_managment_service.student_management.dto.StudentDTO;
import com.student_managment_service.student_management.model.Parent;

public class ParentMapper {
    public static ParentDTO toDTO(Parent parent) {

        ParentDTO dto = new ParentDTO();
        dto.setId(parent.getId());
         dto.setFirstName(parent.getFirstName());
         dto.setLastName(parent.getLastName());
//         dto.setPhone(parent.getPhone());

        if (parent.getStudents() != null) {
            dto.setStudents(
                    parent.getStudents().stream().map(student -> {
                        StudentDTO s = new StudentDTO();
                        s.setId(student.getId());
                         s.setFirstName(student.getFirstName());
                         s.setLastName(student.getLastName());
                        s.setGradeLevel(student.getGradeLevel());
                        return s;
                    }).collect(Collectors.toList())
            );
        }

        return dto;
    }
}
