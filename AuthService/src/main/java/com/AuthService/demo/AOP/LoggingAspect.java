package com.AuthService.demo.AOP;

import jakarta.servlet.http.HttpServletRequest;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Aspect
@Component
public class LoggingAspect {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);

    @Autowired
    private HttpServletRequest request;

    // Apply to ALL controller methods
    @Before("execution(* com.AuthService.demo.controller.*.*(..))")
    public void logBefore(JoinPoint joinPoint) {

        String uri = request.getRequestURI();
        String method = request.getMethod();
        String ip = request.getRemoteAddr();

        logger.info("REQUEST -> {} {} from IP: {}", method, uri, ip);
    }

    @AfterReturning(
        pointcut = "execution(* com.AuthService.demo.controller.*.*(..))",
        returning = "result"
    )
    public void logAfter(JoinPoint joinPoint, Object result) {

        String methodName = joinPoint.getSignature().getName();

        logger.info("SUCCESS -> Method: {} executed successfully", methodName);
    }

    @AfterThrowing(
        pointcut = "execution(* com.AuthService.demo.controller.*.*(..))",
        throwing = "ex"
    )
    public void logError(JoinPoint joinPoint, Throwable ex) {

        String methodName = joinPoint.getSignature().getName();

        logger.error("ERROR -> Method: {} | Message: {}", methodName, ex.getMessage());
    }
}