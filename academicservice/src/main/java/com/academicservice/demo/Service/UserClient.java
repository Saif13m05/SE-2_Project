package com.academicservice.demo.Service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;


import com.academicservice.demo.DTOS.UserDTO;

@FeignClient(
	    name = "AuthService",
	    url = "http://localhost:8081"
	)
public interface UserClient {

	 @PostMapping("/auth/create") 
    int createUser(
        @RequestBody UserDTO userDTO,
        @RequestHeader("X-Internal-Secret") String internal
    );
}