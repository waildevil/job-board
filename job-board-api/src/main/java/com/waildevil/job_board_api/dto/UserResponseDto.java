package com.waildevil.job_board_api.dto;

import com.waildevil.job_board_api.entity.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private Role role;
    private Long companyId;
    private String companyName;
    private String provider;
}
