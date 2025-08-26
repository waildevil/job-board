package com.waildevil.job_board_api.dto;

import com.waildevil.job_board_api.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponseDto {

    private Long id;

    private String resume;

    private String coverLetter;

    private String phoneNumber;

    private String candidateName;

    private String jobTitle;

    private String companyName;

    private LocalDateTime appliedAt;

    private Long jobId;

    private Long userId;

    private ApplicationStatus status;

}
