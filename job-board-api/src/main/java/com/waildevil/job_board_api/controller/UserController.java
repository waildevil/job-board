package com.waildevil.job_board_api.controller;

import com.waildevil.job_board_api.dto.*;
import com.waildevil.job_board_api.entity.User;
import com.waildevil.job_board_api.mapper.UserMapper;
import com.waildevil.job_board_api.repository.UserRepository;
import com.waildevil.job_board_api.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "Users", description = "User account management and profile endpoints")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user", description = "Returns the profile details of the authenticated user")
    public ResponseEntity<UserResponseDto> getCurrentUser(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(userMapper.toResponseDto(user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Returns a list of all registered users (Admin only)")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        var users = userService.getAllUsers().stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Returns the user details for a given ID (Admin only)")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(userMapper::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new user", description = "Creates a new user (Admin only)")
    public ResponseEntity<UserResponseDto> createUser(@RequestBody @Valid UserRegistrationDto dto) {
        var createdUser = userService.createUser(dto);
        return ResponseEntity.ok(userMapper.toResponseDto(createdUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user by ID", description = "Updates user information for the specified ID (Admin only)")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody @Valid UserUpdateDto dto) {
        var updatedUser = userService.updateUser(id, dto);
        return ResponseEntity.ok(userMapper.toResponseDto(updatedUser));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update current user", description = "Updates the profile of the authenticated user")
    public ResponseEntity<UserResponseDto> updateCurrentUser(
            @RequestBody @Valid UserUpdateDto dto,
            Authentication auth) {

        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        userMapper.updateEntity(user, dto);
        User updatedUser = userRepository.save(user);

        return ResponseEntity.ok(userMapper.toResponseDto(updatedUser));
    }






    @PatchMapping("/me/name")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update name", description = "Updates only the user's name")
    public ResponseEntity<UserResponseDto> updateMyName(@RequestBody @Valid NameUpdateDto dto, Authentication auth) {
        var updated = userService.updateOwnName(auth.getName(), dto.name());
        return ResponseEntity.ok(userMapper.toResponseDto(updated));
    }


    @PatchMapping("/me/phone")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update phone number", description = "Updates only the user's phone number")
    public ResponseEntity<UserResponseDto> updateMyPhone(@RequestBody @Valid PhoneUpdateDto dto, Authentication auth) {
        var updated = userService.updateOwnPhone(auth.getName(), dto.phoneNumber());
        return ResponseEntity.ok(userMapper.toResponseDto(updated));
    }


    @PatchMapping("/me/address")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update address", description = "Updates only the user's address")
    public ResponseEntity<UserResponseDto> updateMyAddress(@RequestBody @Valid AddressUpdateDto dto, Authentication auth) {
        var updated = userService.updateOwnAddress(auth.getName(), dto.address());
        return ResponseEntity.ok(userMapper.toResponseDto(updated));
    }


    @PatchMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Change password", description = "Allows the authenticated user to change their password")
    public ResponseEntity<String> updatePassword(@RequestBody @Valid PasswordChangeRequest req, Authentication auth) {
        userService.updatePassword(auth.getName(), req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }

    @PatchMapping("/me/set-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> setPassword(@RequestBody Map<String, String> body, Authentication auth) {
        userService.setInitialPassword(auth.getName(), body.get("newPassword"));
        return ResponseEntity.ok("Password set successfully.");
    }





    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Deletes a user by ID (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
