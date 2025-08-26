package com.waildevil.job_board_api.dto;

public record ResetPasswordRequest(String token, String newPassword) {}

