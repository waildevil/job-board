package com.waildevil.job_board_api.service;


import com.waildevil.job_board_api.dto.JobRequestDto;
import com.waildevil.job_board_api.dto.JobResponseDto;
import com.waildevil.job_board_api.entity.Category;
import com.waildevil.job_board_api.entity.Company;
import com.waildevil.job_board_api.entity.Job;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.mapper.JobMapper;
import com.waildevil.job_board_api.repository.CategoryRepository;
import com.waildevil.job_board_api.repository.CompanyRepository;
import com.waildevil.job_board_api.repository.JobRepository;
import com.waildevil.job_board_api.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobMapper jobMapper;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(Long id) {
        return jobRepository.findById(id);
    }


    public Job createJob(JobRequestDto jobRequestDto, User recruiter) {
        SecurityUtils.requireRecruiter(recruiter);

        Category category = categoryRepository.findById(jobRequestDto.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        Job job = jobMapper.toEntity(jobRequestDto, recruiter, category);

        if (jobRequestDto.getCompanyId() != null) {
            Company company = companyRepository.findById(jobRequestDto.getCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            job.setCompany(company);
        }
        System.out.println("Job ID before save: " + job.getId());
        System.out.println("Saving job: " + job);
        return jobRepository.save(job);
    }

    public Job updateJob(Long id, JobRequestDto dto, User authenticatedRecruiter) {
        SecurityUtils.requireRecruiter(authenticatedRecruiter);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (!job.getRecruiter().getId().equals(authenticatedRecruiter.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update your own jobs.");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));

        jobMapper.updateEntity(job, dto, category);
        return jobRepository.save(job);
    }


    public void deleteJob(Long id, User authenticatedRecruiter) {
        SecurityUtils.requireRecruiter(authenticatedRecruiter);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (!job.getRecruiter().getId().equals(authenticatedRecruiter.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own jobs.");
        }

        jobRepository.delete(job);
    }

    public List<Job> getJobsByRecruiter(User recruiter) {
        return jobRepository.findByRecruiter(recruiter);
    }

    public List<Job> searchJobs(String keyword, String location, String category, String type, Integer minSalary) {
        return jobRepository.searchJobs(keyword, location, type, category, minSalary);
    }


    public Page<Job> getJobsPaginated(Pageable pageable) {
        return jobRepository.findAll(pageable);
    }

    public List<Job> getLatestJobs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return jobRepository.findAll(pageable).getContent();
    }

    public long countByMinExpectedSalary(Integer salary) {
        return jobRepository.countByMinExpectedSalary(salary);
    }

    public long countByFilters(String keyword, String location, String type, String category, Integer salary) {
        return jobRepository.countByFilters(keyword, location, type, category, salary);
    }




}
