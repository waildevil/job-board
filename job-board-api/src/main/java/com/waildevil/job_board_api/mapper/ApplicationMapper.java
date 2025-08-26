package com.waildevil.job_board_api.mapper;

import com.waildevil.job_board_api.dto.*;
import com.waildevil.job_board_api.entity.Application;
import com.waildevil.job_board_api.entity.Job;
import com.waildevil.job_board_api.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    private final ModelMapper mapper = new ModelMapper();

    public ApplicationResponseDto toDto(Application application) {
        ApplicationResponseDto dto = mapper.map(application, ApplicationResponseDto.class);
        dto.setUserId(application.getUser().getId());
        dto.setJobId(application.getJob().getId());
        dto.setStatus(application.getStatus());
        dto.setCandidateName(application.getUser().getName());
        dto.setCompanyName(application.getJob().getCompany().getName());
        return dto;
    }

    public Application toEntity(ApplicationResponseDto dto, User user, Job job) {
        return Application.builder()
                .resume(dto.getResume())
                .coverLetter(dto.getCoverLetter())
                .phoneNumber(dto.getPhoneNumber())
                .user(user)
                .job(job)
                .build();
    }


    public MyApplicationDto toMyDto(Application app) {
        return MyApplicationDto.builder()
                .applicationId(app.getId())
                .jobTitle(app.getJob().getTitle())
                .jobId(app.getJob().getId())
                .companyName(app.getJob().getCompany().getName())
                .location(app.getJob().getLocation())
                .coverLetter(app.getCoverLetter())
                .resumePath(app.getResume())
                .appliedAt(app.getAppliedAt().toString())
                .status(app.getStatus())
                .build();
    }

    public ApplicationSummaryDto toSummaryDto(Application app) {
        return ApplicationSummaryDto.builder()
                .id(app.getId())
                .resume(app.getResume())
                .coverLetter(app.getCoverLetter())
                .appliedAt(app.getAppliedAt())
                .status(app.getStatus())
                .candidate(CandidateSummaryDto.builder()
                        .id(app.getUser().getId())
                        .name(app.getUser().getName())
                        .email(app.getUser().getEmail())
                        .build())
                .build();
    }
}
