package com.waildevil.job_board_api.service;

import com.waildevil.job_board_api.entity.PasswordResetToken;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.repository.PasswordResetTokenRepository;
import com.waildevil.job_board_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserRepository userRepo;
    private final PasswordResetTokenRepository prtRepo;
    private final BCryptPasswordEncoder encoder;
    private final JavaMailSender mail; // or your mail provider

    @Transactional
    public void requestReset(String email, String baseUrl) {
        var userOpt = userRepo.findByEmail(email);
        // Always act as success to avoid user enumeration
        if (userOpt.isEmpty()) return;

        var user = userOpt.get();
        var prt = new PasswordResetToken();
        prt.setToken(UUID.randomUUID().toString());
        prt.setUser(user);
        prt.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        prtRepo.save(prt);

        var resetLink = baseUrl + "/reset-password?token=" + prt.getToken();
        var msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Reset your password");
        msg.setText("Click this link to reset your password: " + resetLink + "\nThis link expires in 30 minutes.");
        mail.send(msg);
    }

    @Transactional
    public void performReset(String token, String newPassword) {
        var prt = prtRepo.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid token"));

        if (prt.isUsed() || prt.getExpiresAt().isBefore(Instant.now()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Token expired");

        var user = prt.getUser();
        user.setPassword(encoder.encode(newPassword));
        prt.setUsed(true);
        // save both
    }
}

