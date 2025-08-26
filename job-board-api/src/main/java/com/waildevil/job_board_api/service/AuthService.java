package com.waildevil.job_board_api.service;

import com.waildevil.job_board_api.dto.AuthenticationResponse;
import com.waildevil.job_board_api.dto.LoginRequest;
import com.waildevil.job_board_api.dto.RegisterRequest;
import com.waildevil.job_board_api.entity.AuthProvider;
import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.repository.UserRepository;
import com.waildevil.job_board_api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {

        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already registered");
        });

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CANDIDATE)
                .provider(AuthProvider.LOCAL)
                .providerId(null)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .token(token)
                .userId(user.getId())
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));


        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This account uses Google Sign-In. Use the Google button to log in.");
        }


        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .userId(user.getId())
                .build();
    }
}
