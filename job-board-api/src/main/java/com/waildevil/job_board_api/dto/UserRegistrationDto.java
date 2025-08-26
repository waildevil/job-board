package com.waildevil.job_board_api.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class UserRegistrationDto {

    private String name;
    private String email;
    private String password;
    private Long companyId;

}
