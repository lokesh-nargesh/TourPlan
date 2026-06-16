package com.tourapp.booking.dto;

import com.tourapp.booking.entity.Booking;
import com.tourapp.booking.entity.FlightBookingDetail;
import com.tourapp.booking.entity.HotelBookingDetail;
import com.tourapp.booking.entity.TrainBookingDetail;
import com.tourapp.booking.entity.TaxiBookingDetail;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Booking booking;
    private FlightBookingDetail flightDetail;
    private HotelBookingDetail hotelDetail;
    private TrainBookingDetail trainDetail;
    private TaxiBookingDetail taxiDetail;
}
