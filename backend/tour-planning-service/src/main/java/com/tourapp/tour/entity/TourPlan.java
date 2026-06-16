package com.tourapp.tour.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "tour_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TourPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String destination;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_budget", nullable = false)
    private Double totalBudget;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(nullable = false)
    private String status; // DRAFT, APPROVED, BOOKED
}
