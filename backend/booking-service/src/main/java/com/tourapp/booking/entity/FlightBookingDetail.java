package com.tourapp.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flight_bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightBookingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "flight_number", nullable = false)
    private String flightNumber;

    @Column(name = "departure_airport", nullable = false)
    private String departureAirport;

    @Column(name = "arrival_airport", nullable = false)
    private String arrivalAirport;

    @Column(name = "departure_time")
    private String departureTime;

    @Column(name = "arrival_time")
    private String arrivalTime;

    @Column(name = "seat_number")
    private String seatNumber;
}
