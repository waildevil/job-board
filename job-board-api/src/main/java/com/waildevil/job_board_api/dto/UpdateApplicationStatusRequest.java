package com.waildevil.job_board_api.dto;

import com.waildevil.job_board_api.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationStatusRequest {
    @NotNull
    private ApplicationStatus status;
}
