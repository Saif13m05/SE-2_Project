package com.academicservice.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class AcademicserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AcademicserviceApplication.class, args);
	}

}
