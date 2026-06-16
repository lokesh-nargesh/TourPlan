package com.tourapp.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "train_bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainBookingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "train_number", nullable = false)
    private String trainNumber;

    @Column(name = "source_station", nullable = false)
    private String sourceStation;

    @Column(name = "destination_station", nullable = false)
    private String destinationStation;

    @Column(name = "coach_class")
    private String coachClass;

    private String pnr;
}
