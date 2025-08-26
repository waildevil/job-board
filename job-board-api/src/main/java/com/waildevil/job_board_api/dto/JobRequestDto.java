package com.waildevil.job_board_api.dto;

import lombok.Data;

@Data
public class JobRequestDto {
    private String title;
    private String description;
    private String location;
    private String type;
    private Integer minSalary;
    private Integer maxSalary;
    private String salaryText;
    private Long companyId;
    private Long categoryId;
}
