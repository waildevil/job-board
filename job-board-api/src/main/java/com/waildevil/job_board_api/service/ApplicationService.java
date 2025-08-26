package com.waildevil.job_board_api.service;

import com.waildevil.job_board_api.dto.ApplicationResponseDto;
import com.waildevil.job_board_api.dto.JobWithStatsDto;
import com.waildevil.job_board_api.entity.*;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.mapper.ApplicationMapper;
import com.waildevil.job_board_api.repository.ApplicationRepository;
import com.waildevil.job_board_api.repository.JobRepository;
import com.waildevil.job_board_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final EmailService emailService;

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }

    public Application createApplication(ApplicationResponseDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        if (applicationRepository.existsByUserAndJob(user, job)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You already applied to this job.");
        }

        Application application = applicationMapper.toEntity(dto, user, job);
        application.setAppliedAt(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        return applicationRepository.save(application);
    }

    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    public List<Application> getApplicationsForEmployer(String email) {
        return applicationRepository.findByRecruiterEmail(email);
    }

    public List<Application> getApplicationsForUser(String email) {
        return applicationRepository.findByUserEmail(email);
    }

    public List<Application> getApplicationsForJob(Long jobId, String employerEmail) {
        Job job = jobRepository.findById(jobId).orElseThrow();

        if (!job.getRecruiter().getEmail().equals(employerEmail)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not the owner of this job");
        }

        return applicationRepository.findByJobId(jobId);
    }

    public Application updateApplicationStatus(Long applicationId, ApplicationStatus newStatus, String requesterEmail) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Requester not found"));

        Role role = requester.getRole();

        boolean isAdmin = role == Role.ADMIN;
        User recruiter = application.getJob().getRecruiter();
        boolean isOwner = recruiter != null && recruiter.getEmail().equals(requesterEmail);

        if (!isAdmin && !isOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not allowed to change this application's status.");
        }

        Job job = application.getJob();

        if (application.getStatus() == ApplicationStatus.ACCEPTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This application is already accepted.");
        }

        if (newStatus == ApplicationStatus.ACCEPTED) {
            long acceptedCount = applicationRepository.countAcceptedApplications(job, ApplicationStatus.ACCEPTED);
            if (acceptedCount >= job.getAvailablePositions()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "No available positions left for this job.");
            }
        }

        application.setStatus(newStatus);
        Application updated = applicationRepository.save(application);

        emailService.sendStatusChangeEmail(
                application.getUser().getEmail(),
                job.getTitle(),
                newStatus.name()
        );


        if (newStatus == ApplicationStatus.ACCEPTED) {
            long acceptedCount = applicationRepository.countAcceptedApplications(job, ApplicationStatus.ACCEPTED);
            if (acceptedCount >= job.getAvailablePositions()) {
                List<Application> pendingApps = applicationRepository.findByJobAndStatus(job, ApplicationStatus.PENDING);
                for (Application pending : pendingApps) {
                    pending.setStatus(ApplicationStatus.REJECTED);


                    emailService.sendStatusChangeEmail(
                            pending.getUser().getEmail(),
                            job.getTitle(),
                            "REJECTED"
                    );
                }
                applicationRepository.saveAll(pendingApps);
            }
        }

        return updated;
    }


    public JobWithStatsDto getJobStats(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Job not found"));

        long accepted = applicationRepository.countAcceptedApplications(job, ApplicationStatus.ACCEPTED);
        int remaining = job.getAvailablePositions() - (int) accepted;

        return JobWithStatsDto.builder()
                .id(job.getId())
                .title(job.getTitle())
                .availablePositions(job.getAvailablePositions())
                .acceptedCount(accepted)
                .remainingPositions(Math.max(remaining, 0))
                .build();
    }

    public boolean hasApplied(Long userId, Long jobId) {
        return applicationRepository.existsByUserIdAndJobId(userId, jobId);
    }

    public Application requireOwnedApplication(Long applicationId, String recruiterEmail) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Application not found"));

        if (app.getJob() == null || app.getJob().getRecruiter() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Forbidden");
        }
        String owner = app.getJob().getRecruiter().getEmail();
        if (!recruiterEmail.equalsIgnoreCase(owner)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You don’t own this application.");
        }
        return app;
    }
}
