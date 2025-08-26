package com.waildevil.job_board_api.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;


@Getter
@Setter
@NoArgsConstructor
@Entity
public class PasswordResetToken {
    @Id @GeneratedValue
    private Long id;
    @Column(nullable=false, unique=true) private String token;
    @ManyToOne(optional=false, fetch= FetchType.LAZY) private User user;
    @Column(nullable=false) private Instant expiresAt;
    @Column(nullable=false) private boolean used = false;
}
