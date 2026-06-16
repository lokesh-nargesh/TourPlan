package com.tourapp.booking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotel_bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_id", nullable = false, unique = true)
    private Long bookingId;

    @Column(name = "hotel_name", nullable = false)
    private String hotelName;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "check_in_date")
    private String checkInDate;

    @Column(name = "check_out_date")
    private String checkOutDate;

    @Column(name = "guests_count")
    private Integer guestsCount;
}
