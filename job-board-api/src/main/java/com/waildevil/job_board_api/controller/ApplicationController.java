package com.waildevil.job_board_api.controller;

import com.waildevil.job_board_api.dto.*;
import com.waildevil.job_board_api.entity.Application;
import com.waildevil.job_board_api.mapper.ApplicationMapper;
import com.waildevil.job_board_api.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Applications", description = "Endpoints for applying to jobs and application management")
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationMapper applicationMapper;

    @GetMapping
    @Operation(summary = "Get all applications", description = "Returns all applications in the system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApplicationResponseDto>> getAll() {
        return ResponseEntity.ok(
                applicationService.getAllApplications()
                        .stream()
                        .map(applicationMapper::toDto)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID", description = "Returns a single application by its ID")
    public ResponseEntity<ApplicationResponseDto> getById(@PathVariable Long id) {
        return applicationService.getApplicationById(id)
                .map(applicationMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Apply to a job", description = "Submit a job application with resume and cover letter")
    public ResponseEntity<ApplicationResponseDto> create(
            @RequestParam("resume") MultipartFile resume,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("jobId") Long jobId,
            Authentication auth
    ) throws IOException {
        String username = auth.getName();
        String safeUsername = username.replaceAll("[^a-zA-Z0-9]", "_");

        String resumeDir = "uploads/resumes/" + safeUsername + "/";
        String coverLetterDir = "uploads/coverletters/" + safeUsername + "/";

        Files.createDirectories(Paths.get(resumeDir));
        Files.createDirectories(Paths.get(coverLetterDir));

        String resumeFilename = UUID.randomUUID() + "_" + resume.getOriginalFilename();
        Path resumePath = Paths.get(resumeDir, resumeFilename);
        Files.copy(resume.getInputStream(), resumePath);

        String coverLetterPath = null;
        if (coverLetter != null && !coverLetter.isEmpty()) {
            String coverLetterFilename = UUID.randomUUID() + "_" + coverLetter.getOriginalFilename();
            Path coverPath = Paths.get(coverLetterDir, coverLetterFilename);
            Files.copy(coverLetter.getInputStream(), coverPath);
            coverLetterPath = coverPath.toString();
        }

        ApplicationResponseDto dto = ApplicationResponseDto.builder()
                .resume(resumePath.toString())
                .coverLetter(coverLetterPath)
                .phoneNumber(phoneNumber)
                .jobId(jobId)
                .build();

        Application created = applicationService.createApplication(dto, username);
        return ResponseEntity.ok(applicationMapper.toDto(created));
    }


    @DeleteMapping("/{id}")
    @Operation(summary = "Delete application", description = "Deletes an application by ID")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get applications for current employer", description = "Returns applications for jobs posted by the authenticated employer")
    public ResponseEntity<List<ApplicationResponseDto>> getEmployerApplications(Authentication auth) {
        List<Application> apps = applicationService.getApplicationsForEmployer(auth.getName());
        List<ApplicationResponseDto> response = apps.stream()
                .map(applicationMapper::toDto)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    @Operation(summary = "Get my applications", description = "Returns all applications submitted by the authenticated candidate")
    public ResponseEntity<List<MyApplicationDto>> getMyApplications(Authentication auth) {
        List<MyApplicationDto> list = applicationService.getApplicationsForUser(auth.getName())
                .stream()
                .map(applicationMapper::toMyDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasRole('RECRUITER')")
    @Operation(summary = "Get applications for a job", description = "Returns all applications submitted for a specific job posted by the authenticated employer")
    public ResponseEntity<List<ApplicationSummaryDto>> getApplicationsForJob(
            @PathVariable Long jobId,
            Authentication auth
    ) {
        List<ApplicationSummaryDto> list = applicationService.getApplicationsForJob(jobId, auth.getName())
                .stream()
                .map(applicationMapper::toSummaryDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECRUITER')")
    public ResponseEntity<ApplicationResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateApplicationStatusRequest request,
            Authentication auth
    ) {
        Application updated = applicationService.updateApplicationStatus(id, request.getStatus(), auth.getName());
        return ResponseEntity.ok(applicationMapper.toDto(updated));
    }

    @GetMapping("/jobs/{jobId}/stats")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    @Operation(summary = "Get job application stats", description = "Returns number of accepted and remaining positions for a job")
    public ResponseEntity<JobWithStatsDto> getJobStats(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getJobStats(jobId));
    }

    @GetMapping("/has-applied")
    public ResponseEntity<Boolean> hasApplied(
            @RequestParam Long userId,
            @RequestParam Long jobId) {
        boolean exists = applicationService.hasApplied(userId, jobId);
        return ResponseEntity.ok(exists);
    }


    @GetMapping("/{id}/resume")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Resource> getResume(@PathVariable Long id, Authentication auth) throws IOException {
        Application app = applicationService.requireOwnedApplication(id, auth.getName());
        return streamFile(app.getResume());
    }

    // Recruiter-only: stream cover letter
    @GetMapping("/{id}/cover-letter")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Resource> getCoverLetter(@PathVariable Long id, Authentication auth) throws IOException {
        Application app = applicationService.requireOwnedApplication(id, auth.getName());
        if (app.getCoverLetter() == null || app.getCoverLetter().isBlank()) {
            return ResponseEntity.notFound().build();
        }
        return streamFile(app.getCoverLetter());
    }

    private ResponseEntity<Resource> streamFile(String dbPath) throws IOException {
        if (dbPath == null || dbPath.isBlank()) return ResponseEntity.notFound().build();

        // Convert backslashes to forward slashes
        String fixed = dbPath.replace("\\", "/");

        // uploads root
        Path uploadsRoot = Paths.get("uploads").toAbsolutePath().normalize();

        // If the db path already starts with "uploads/", strip it
        if (fixed.startsWith("uploads/")) {
            fixed = fixed.substring("uploads/".length());
        }

        // Now resolve correctly inside uploads/
        Path filePath = uploadsRoot.resolve(fixed).normalize();

        if (!filePath.startsWith(uploadsRoot) || !Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filePath.getFileName().toString() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }





}
