package com.tourapp.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "taxi_bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxiBookingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "taxi_type", nullable = false)
    private String taxiType;

    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;

    @Column(name = "drop_location", nullable = false)
    private String dropLocation;

    @Column(name = "pickup_time")
    private String pickupTime;

    @Column(name = "driver_name")
    private String driverName;

    @Column(name = "driver_phone")
    private String driverPhone;
}
