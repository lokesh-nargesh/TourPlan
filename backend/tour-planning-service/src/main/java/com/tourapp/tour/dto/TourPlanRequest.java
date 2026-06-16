package com.tourapp.tour.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourPlanRequest {
    private Long userId;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalBudget;
}
