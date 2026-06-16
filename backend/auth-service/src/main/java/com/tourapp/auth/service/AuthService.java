package com.tourapp.auth.service;

import com.tourapp.auth.dto.AuthResponse;
import com.tourapp.auth.dto.LoginRequest;
import com.tourapp.auth.dto.RegisterRequest;
import com.tourapp.auth.entity.User;
import com.tourapp.auth.repository.UserRepository;
import com.tourapp.auth.util.JwtUtil;
import com.tourapp.common.exception.BadRequestException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        String role = request.getRole() != null ? request.getRole().toUpperCase() : "USER";
        if (!role.equals("USER") && !role.equals("ADMIN")) {
            role = "USER";
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole(), savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password!");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public boolean validateToken(String token) {
        try {
            String username = jwtUtil.extractUsername(token);
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                return false;
            }
            return jwtUtil.validateToken(token, user.getUsername());
        } catch (Exception e) {
            return false;
        }
    }
}
