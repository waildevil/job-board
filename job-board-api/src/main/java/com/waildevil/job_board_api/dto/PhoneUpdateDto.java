// dto/PhoneUpdateDto.java
package com.waildevil.job_board_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PhoneUpdateDto(
        // E.164-ish; relax if you store local formats
        @NotBlank
        @Size(max = 20)
        @Pattern(regexp = "^\\+?[0-9 ()-]{6,20}$")
        String phoneNumber
) {}
