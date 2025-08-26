package com.waildevil.job_board_api.repository;

import com.waildevil.job_board_api.entity.Job;
import com.waildevil.job_board_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByRecruiter(User recruiter);
    List<Job> findByRecruiterId(Long recruiterId);



    @Query("SELECT j FROM Job j WHERE " +
            "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:category IS NULL OR j.category.name = :category) AND " +
            "(:type IS NULL OR j.type = :type) AND " +
            "(:minSalary IS NULL OR j.maxSalary >= :minSalary)")
    List<Job> searchJobs(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("category") String category,
            @Param("type") String type,
            @Param("minSalary") Integer minSalary
    );


    @Query("SELECT COUNT(j) FROM Job j WHERE j.maxSalary >= :salary")
    long countByMinExpectedSalary(@Param("salary") Integer salary);


    @Query("SELECT COUNT(j) FROM Job j " +
            "WHERE (:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:type IS NULL OR j.type = :type) " +
            "AND (:category IS NULL OR j.category.name = :category) " +
            "AND (:salary IS NULL OR j.maxSalary >= :salary)")
    long countByFilters(
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("type") String type,
            @Param("category") String category,
            @Param("salary") Integer salary
    );




}
