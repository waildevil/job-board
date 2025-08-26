package com.waildevil.job_board_api.repository;

import com.waildevil.job_board_api.entity.Company;
import com.waildevil.job_board_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByCompany(Company company);

}
