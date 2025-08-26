package com.waildevil.job_board_api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobWithStatsDto {
    private Long id;
    private String title;
    private int availablePositions;
    private long acceptedCount;
    private int remainingPositions;
}
