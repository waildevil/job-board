package com.waildevil.job_board_api.mapper;

import com.waildevil.job_board_api.dto.UserRegistrationDto;
import com.waildevil.job_board_api.dto.UserResponseDto;
import com.waildevil.job_board_api.dto.UserUpdateDto;
import com.waildevil.job_board_api.entity.Company;
import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(UserRegistrationDto dto) {
        return User.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(Role.CANDIDATE)
                .build();
    }

    public UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .companyId(user.getCompany() != null ? user.getCompany().getId() : null)
                .companyName(user.getCompany() != null ? user.getCompany().getName() : null)
                .provider(user.getProvider() != null ? user.getProvider().name() : "LOCAL")
                .build();
    }

    public void updateEntity(User user, UserUpdateDto dto, Company company) {
        user.setName(dto.getName());
        user.setCompany(company);
    }

    public void updateEntity(User user, UserUpdateDto dto) {
        user.setName(dto.getName());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());

    }
}
