package com.waildevil.job_board_api.dto;

import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class JobResponseDto {
    private Long id;
    private String title;
    private String description;
    private String location;
    private String type;
    private Integer minSalary;
    private Integer maxSalary;
    private String salaryText;
    private String companyName;
    private RecruiterResponseDto recruiter;
    private String category;
    private Instant createdAt;
}
