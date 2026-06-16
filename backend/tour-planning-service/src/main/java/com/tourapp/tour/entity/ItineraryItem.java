package com.tourapp.tour.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itineraries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tour_plan_id", nullable = false)
    private Long tourPlanId;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "activity_title", nullable = false)
    private String activityTitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "estimated_cost")
    private Double estimatedCost;
}
