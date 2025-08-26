package com.waildevil.job_board_api.dto;

import com.waildevil.job_board_api.entity.Role;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class UserUpdateDto {
    private String name;
    private String phoneNumber;
    private String address;
}
