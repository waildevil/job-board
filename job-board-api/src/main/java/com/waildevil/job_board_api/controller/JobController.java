package com.waildevil.job_board_api.controller;

import com.waildevil.job_board_api.dto.JobRequestDto;
import com.waildevil.job_board_api.dto.JobResponseDto;
import com.waildevil.job_board_api.entity.Job;
import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.mapper.JobMapper;
import com.waildevil.job_board_api.repository.JobRepository;
import com.waildevil.job_board_api.repository.UserRepository;
import com.waildevil.job_board_api.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Jobs", description = "Job management endpoints")
@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @GetMapping
    @Operation(summary = "Get all jobs", description = "Returns a list of all job postings")
    public ResponseEntity<Map<String, Object>> getAllJobs(Pageable pageable) {
        Page<Job> jobPage = jobService.getJobsPaginated(pageable);
        List<JobResponseDto> jobDtos = jobPage.getContent()
                .stream()
                .map(jobMapper::toResponseDto)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("jobs", jobDtos);
        response.put("meta", Map.of(
                "currentPage", jobPage.getNumber(),
                "totalPages", jobPage.getTotalPages(),
                "totalItems", jobPage.getTotalElements(),
                "pageSize", jobPage.getSize()
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get job by ID", description = "Returns the job with the given ID")
    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDto> getJob(@PathVariable Long id) {
        return jobService.getJobById(id)
                .map(jobMapper::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create new job", description = "Creates a new job posting (RECRUITER only)")
    @PostMapping
    public ResponseEntity<JobResponseDto> createJob(@Valid @RequestBody JobRequestDto dto, Authentication auth) {
        User recruiter = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recruiter not found"));

        if(!recruiter.getRole().equals(Role.RECRUITER)){
            throw new ApiException(HttpStatus.FORBIDDEN, "Only recruiters can create jobs");
        }

        System.out.println("Incoming job request: " + dto);
        Job saved = jobService.createJob(dto, recruiter);
        return ResponseEntity.status(HttpStatus.CREATED).body(jobMapper.toResponseDto(saved));
    }

    @Operation(summary = "Update a job", description = "Updates an existing job posting (RECRUITER only)")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponseDto> updateJob(@PathVariable Long id,
                                                    @Valid @RequestBody JobRequestDto dto,
                                                    Authentication auth) {
        User recruiter = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recruiter not found"));
        Job updatedJob = jobService.updateJob(id, dto, recruiter);
        return ResponseEntity.ok(jobMapper.toResponseDto(updatedJob));
    }

    @Operation(summary = "Delete a job", description = "Deletes a job by ID (RECRUITER only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id, Authentication auth) {
        User recruiter = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recruiter not found"));
        jobService.deleteJob(id, recruiter);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get recruiter's own jobs", description = "Returns jobs posted by the logged-in recruiter")
    @GetMapping("/me")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<List<JobResponseDto>> getMyJobs(Authentication auth) {
        User recruiter = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Recruiter not found"));

        List<Job> mine = jobRepository.findByRecruiterId(recruiter.getId());

        List<JobResponseDto> dtos = mine.stream()
                .map(jobMapper::toResponseDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @Operation(summary = "Search jobs", description = "Search jobs by title, location, type, and salary range")
    @GetMapping("/search")
    public ResponseEntity<List<JobResponseDto>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) String category
    ) {
        List<JobResponseDto> results = jobService.searchJobs(keyword, location, type, category, minSalary)
                .stream()
                .map(jobMapper::toResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/latest")
    public ResponseEntity<Page<JobResponseDto>> getLatestJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Job> jobPage = jobRepository.findAll(pageable);
        Page<JobResponseDto> dtoPage = jobPage.map(jobMapper::toResponseDto);
        return ResponseEntity.ok(dtoPage);
    }

    /*
    @GetMapping("/count")
    public ResponseEntity<Long> countByMinExpectedSalary(@RequestParam Integer salary) {
        long count = jobService.countByMinExpectedSalary(salary);
        return ResponseEntity.ok(count);
    }

     */

    @GetMapping("/count")
    public long countByFilters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer salary
    ) {
        return jobService.countByFilters(keyword, location, type, category, salary);
    }



}




