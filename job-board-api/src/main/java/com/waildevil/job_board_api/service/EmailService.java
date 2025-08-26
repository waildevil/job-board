package com.waildevil.job_board_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendStatusChangeEmail(String to, String jobTitle, String status) {
        String subject = "Update on your job application";
        String text = switch (status.toUpperCase()) {
            case "ACCEPTED" -> "Congratulations! You have been accepted for the job: " + jobTitle;
            case "REJECTED" -> "Leider, we regret to inform you that your application for the job '" + jobTitle + "' has been rejected.";
            default -> "Your application status for '" + jobTitle + "' has been updated to: " + status;
        };

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
