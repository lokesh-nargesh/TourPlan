package com.tourapp.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tour_plan_id", nullable = false)
    private Long tourPlanId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type; // FLIGHT, HOTEL, TRAIN, TAXI

    @Column(name = "reference_number", nullable = false, unique = true)
    private String referenceNumber;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String status; // PENDING, CONFIRMED, CANCELLED

    @Column(name = "booking_date")
    private LocalDateTime bookingDate;

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
    }
}
