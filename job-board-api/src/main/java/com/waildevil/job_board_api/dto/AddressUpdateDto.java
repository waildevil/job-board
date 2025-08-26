// dto/AddressUpdateDto.java
package com.waildevil.job_board_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressUpdateDto(
        @NotBlank @Size(max = 255) String address
) {}
