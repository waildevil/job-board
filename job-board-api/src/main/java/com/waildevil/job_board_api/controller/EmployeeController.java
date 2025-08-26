package com.waildevil.job_board_api.controller;

import com.waildevil.job_board_api.dto.UserRegistrationDto;
import com.waildevil.job_board_api.dto.UserUpdateDto;
import com.waildevil.job_board_api.dto.UserResponseDto;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.mapper.UserMapper;
import com.waildevil.job_board_api.security.SecurityUtils;
import com.waildevil.job_board_api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getEmployees(Authentication auth) {
        User manager = (User) auth.getPrincipal();
        SecurityUtils.requireManager(manager);
        List<UserResponseDto> employees = userService.getEmployees(manager).stream()
                .map(userMapper::toResponseDto)
                .toList();
        return ResponseEntity.ok(employees);
    }

    @PostMapping
    public ResponseEntity<UserResponseDto> addEmployee(@RequestParam Long companyId,
                                                       @RequestBody UserRegistrationDto dto,
                                                       Authentication auth) {
        User manager = (User) auth.getPrincipal();
        SecurityUtils.requireManager(manager);
        User employee = userService.addEmployee(manager, companyId, dto);
        return ResponseEntity.ok(userMapper.toResponseDto(employee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateEmployee(@PathVariable Long id,
                                                          @RequestBody UserUpdateDto dto,
                                                          Authentication auth) {
        User manager = (User) auth.getPrincipal();
        SecurityUtils.requireManager(manager);
        User updated = userService.updateEmployee(manager, id, dto);
        return ResponseEntity.ok(userMapper.toResponseDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id,
                                               Authentication auth) {
        User manager = (User) auth.getPrincipal();
        SecurityUtils.requireManager(manager);
        userService.removeEmployee(manager, id);
        return ResponseEntity.noContent().build();
    }
}
