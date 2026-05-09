package com.student_managment_service.student_management.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    //  Intercept all service methods
    @Around("execution(* com.student_managment_service.student_management.service..*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {

        long start = System.currentTimeMillis();

        String methodName = joinPoint.getSignature().toShortString();

        logger.info("➡️ ENTER: " + methodName);

        Object result = joinPoint.proceed(); // execute actual method

        long timeTaken = System.currentTimeMillis() - start;

        logger.info("⬅️ EXIT: " + methodName + " | Time: " + timeTaken + "ms");

        return result;
    }
}