package com.waildevil.job_board_api.mapper;

import com.waildevil.job_board_api.dto.JobRequestDto;
import com.waildevil.job_board_api.dto.JobResponseDto;
import com.waildevil.job_board_api.dto.RecruiterResponseDto;
import com.waildevil.job_board_api.entity.Category;
import com.waildevil.job_board_api.entity.Job;
import com.waildevil.job_board_api.entity.User;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;
import java.util.List;

@Component
public class JobMapper {



    public JobResponseDto toResponseDto(Job job) {



        return JobResponseDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .location(job.getLocation())
                .type(job.getType())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .salaryText(formatSalary(job.getMinSalary(), job.getMaxSalary()))
                .companyName(job.getCompany() != null ? job.getCompany().getName() : null)
                .recruiter(toRecruiterResponseDto(job))
                .category(job.getCategory() != null ? job.getCategory().getName() : null)
                .createdAt(job.getCreatedAt())
                .build();
    }

    private RecruiterResponseDto toRecruiterResponseDto(Job job) {
        User recruiter = job.getRecruiter();
        return recruiter != null
                ? RecruiterResponseDto.builder()
                .id(recruiter.getId())
                .name(recruiter.getName())
                .email(recruiter.getEmail())
                .build()
                : null;
    }



    public Job toEntity(JobRequestDto dto, User recruiter, Category category) {
        return Job.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .type(dto.getType())
                .minSalary(dto.getMinSalary())
                .maxSalary(dto.getMaxSalary())
                .salaryText(formatSalary(dto.getMinSalary(), dto.getMaxSalary()))
                .category(category)
                .recruiter(recruiter)
                .company(recruiter.getCompany())
                .build();
    }



    public void updateEntity(Job job, JobRequestDto dto, Category category) {
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setType(dto.getType());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setSalaryText(formatSalary(dto.getMinSalary(), dto.getMaxSalary()));
        job.setCategory(category);
    }


    private String formatSalary(Integer min, Integer max) {
        if (min != null && max != null) {
            if (min.equals(max)) {
                return String.format("€%,d", min);
            }
            return String.format("€%,d - €%,d", min, max);
        } else if (min != null) {
            return String.format("From €%,d", min);
        } else if (max != null) {
            return String.format("Up to €%,d", max);
        }
        return null;
    }
}
