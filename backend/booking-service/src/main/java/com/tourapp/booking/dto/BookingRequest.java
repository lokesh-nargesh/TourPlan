package com.tourapp.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long tourPlanId;
    private Long userId;
    private String type; // FLIGHT, HOTEL, TRAIN, TAXI
    private Double price;

    // Flight Details (Optional)
    private String flightNumber;
    private String departureAirport;
    private String arrivalAirport;
    private String departureTime;
    private String arrivalTime;
    private String seatNumber;

    // Hotel Details (Optional)
    private String hotelName;
    private String roomType;
    private String checkInDate;
    private String checkOutDate;
    private Integer guestsCount;

    // Train Details (Optional)
    private String trainNumber;
    private String sourceStation;
    private String destinationStation;
    private String coachClass;

    // Taxi Details (Optional)
    private String taxiType;
    private String pickupLocation;
    private String dropLocation;
    private String pickupTime;
    private String driverName;
    private String driverPhone;
}
