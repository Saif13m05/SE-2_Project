//package com.AuthService.demo.jwt;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import com.AuthService.demo.exception.JwtException;
//
//import java.io.IOException;
//import java.util.List;
//
//@Component
//public class JwtFilter extends OncePerRequestFilter {
//
//    @Autowired
//    private JwtUtil jwtUtil;
//
//    @Override
//    protected void doFilterInternal(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            FilterChain filterChain
//    ) throws ServletException, IOException {
//
//        String authHeader = request.getHeader("Authorization");
//
//        //  no token → continue normally
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            filterChain.doFilter(request, response);
//            return;
//        }
//
//        String token = authHeader.substring(7);
//
//        try {
//
//            //  extract data from token
//            String email = jwtUtil.extractEmail(token);
//            String role = jwtUtil.extractRole(token);
//
//      
//            //  convert role → Spring format
//            SimpleGrantedAuthority authority =
//                    new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
//
//            //  create authentication
//            UsernamePasswordAuthenticationToken authToken =
//                    new UsernamePasswordAuthenticationToken(
//                            email,          // principal
//                            null,           // credentials
//                            List.of(authority)
//                    );
//
//            //  set context
//            SecurityContextHolder.getContext().setAuthentication(authToken);
//
//
//        } catch (JwtException  e) {
//            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//            response.getWriter().write(e.getMessage());
//            return;
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}