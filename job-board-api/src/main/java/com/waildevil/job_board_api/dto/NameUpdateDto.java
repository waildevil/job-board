// dto/NameUpdateDto.java
package com.waildevil.job_board_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NameUpdateDto(
        @NotBlank @Size(max = 80) String name
) {}
