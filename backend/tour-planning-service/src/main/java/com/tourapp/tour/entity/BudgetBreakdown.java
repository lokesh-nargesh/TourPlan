package com.tourapp.tour.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "budget_breakdowns")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetBreakdown {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tour_plan_id", nullable = false)
    private Long tourPlanId;

    @Column(nullable = false)
    private String category; // FLIGHT, HOTEL, TRAIN, TAXI, FOOD, MISC

    @Column(name = "allocated_amount", nullable = false)
    private Double allocatedAmount;

    @Column(name = "spent_amount", nullable = false)
    private Double spentAmount;
}
