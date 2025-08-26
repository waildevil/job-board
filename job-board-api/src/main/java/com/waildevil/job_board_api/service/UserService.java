package com.waildevil.job_board_api.service;

import com.waildevil.job_board_api.dto.UserDto;
import com.waildevil.job_board_api.dto.UserRegistrationDto;
import com.waildevil.job_board_api.dto.UserUpdateDto;
import com.waildevil.job_board_api.entity.Company;
import com.waildevil.job_board_api.entity.Role;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.exception.ApiException;
import com.waildevil.job_board_api.exception.InvalidOldPasswordException;
import com.waildevil.job_board_api.mapper.UserMapper;
import com.waildevil.job_board_api.repository.CompanyRepository;
import com.waildevil.job_board_api.repository.UserRepository;
import com.waildevil.job_board_api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CompanyRepository companyRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        User admin = SecurityUtils.getAuthenticatedUser();
        SecurityUtils.requireRole(admin, Role.ADMIN);
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getEmployees(User manager) {
        SecurityUtils.requireRole(manager, Role.MANAGER);

        Company company = manager.getCompany();
        if (company == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Manager does not belong to a company.");
        }

        return userRepository.findByCompany(company);
    }

    public User createUser(UserRegistrationDto dto) {
        User user = userMapper.toEntity(dto);


        user.setPassword(passwordEncoder.encode(dto.getPassword()));


        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found"));
            user.setCompany(company);
        }

        return userRepository.save(user);
    }

    //❌❌
    public User updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        userMapper.updateEntity(user, dto);
        return userRepository.save(user);
    }

    public User addEmployee(User manager, Long companyId, UserRegistrationDto dto) {
        SecurityUtils.requireRole(manager, Role.MANAGER);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found"));

        if (!manager.getCompany().getId().equals(company.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage employees in your own company.");
        }

        User employee = userMapper.toEntity(dto);
        employee.setPassword(passwordEncoder.encode(dto.getPassword()));
        employee.setCompany(company);

        return userRepository.save(employee);
    }

    public User updateEmployee(User manager, Long employeeId, UserUpdateDto dto) {
        SecurityUtils.requireRole(manager, Role.MANAGER);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));

        if (!manager.getCompany().getId().equals(employee.getCompany().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only update employees in your own company.");
        }

        userMapper.updateEntity(employee, dto, manager.getCompany());
        return userRepository.save(employee);
    }

    public void removeEmployee(User manager, Long employeeId) {
        SecurityUtils.requireRole(manager, Role.MANAGER);

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found"));

        if (!manager.getCompany().getId().equals(employee.getCompany().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only remove employees from your own company.");
        }

        userRepository.delete(employee);
    }

    public User updateOwnProfile(User authenticatedUser, UserUpdateDto dto) {
        userMapper.updateEntity(authenticatedUser, dto);
        return userRepository.save(authenticatedUser);
    }


    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }


    @Transactional
    public User updateOwnName(String email, String name) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setName(name.trim());
        return userRepository.save(u);
    }

    @Transactional
    public User updateOwnPhone(String email, String phoneNumber) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setPhoneNumber(phoneNumber.trim());
        return userRepository.save(u);
    }

    @Transactional
    public User updateOwnAddress(String email, String address) {
        User u = userRepository.findByEmail(email).orElseThrow();
        u.setAddress(address.trim());
        return userRepository.save(u);
    }

    @Transactional
    public void updatePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email).orElseThrow();

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be different");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void setInitialPassword(String email, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // Only allow if the user effectively has no real password yet
        String current = user.getPassword();
        boolean looksNoop = current == null || current.startsWith("{noop}");
        boolean notBcrypt = current == null || !(current.startsWith("$2a$") || current.startsWith("$2b$") || current.startsWith("$2y$"));


        if (!looksNoop && !notBcrypt) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password already set. Use change password instead.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }



}
