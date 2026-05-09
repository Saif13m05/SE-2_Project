package com.AuthService.demo.jwt;
import com.AuthService.demo.exception.JwtException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.AuthService.demo.Entity.User;

import java.security.Key;
import java.util.Date;

@Component

public class JwtUtil {
	
	@Value("${jwt.secret}")
	private String secret;
	
	 @Value("${jwt.expiration}")
	  private long expiration;
	 
	 
	 private Key getSigningKey() {
	        return Keys.hmacShaKeyFor(secret.getBytes());
	    }
	 
	 public String generateToken(User user) {

	        return Jwts.builder()
	                .setSubject(user.getEmail())
	                .claim("userId", user.getId())
	                .claim("role", user.getRole().getRoleName())
	                .claim("username", user.getFirstName())
	                .setIssuedAt(new Date())
	                .setExpiration(new Date(System.currentTimeMillis() + expiration))
	                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
	                .compact();
	   }
	 
	 
	 public Claims extractAllClaims(String token) {
	        return Jwts.parserBuilder()
	                .setSigningKey(getSigningKey())
	                .build()
	                .parseClaimsJws(token)
	                .getBody();
	    }
	 
	 
	 public boolean isTokenValid(String token) {
	        try {
	            extractAllClaims(token);
	            return true;
	        } catch (ExpiredJwtException e) {
	            throw new JwtException("Token expired");
	        } catch (MalformedJwtException e) {
	            throw new JwtException("Invalid token format");
	        } catch (Exception e) {
	            throw new JwtException("Token validation failed: " + e.getMessage());
	        }
	    }
	  
	 
	 public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
     }

	 public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
     }

	 public Integer extractUserId(String token) {
        return (Integer) extractAllClaims(token).get("userId");
     }
	 
	 
	 
	 
	 @PostConstruct
	 public void printKey() {
	     System.out.println("SECRET = " + secret);
	 }
}

