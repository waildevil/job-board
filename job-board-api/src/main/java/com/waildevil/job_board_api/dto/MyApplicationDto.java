package com.waildevil.job_board_api.dto;

import com.waildevil.job_board_api.entity.ApplicationStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyApplicationDto {
    private Long applicationId;
    private Long jobId;
    private String jobTitle;
    private String coverLetter;
    private String resumePath;
    private String appliedAt;
    private String companyName;
    private String location;
    private ApplicationStatus status;
}
