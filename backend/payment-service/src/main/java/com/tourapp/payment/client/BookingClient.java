package com.tourapp.payment.client;

import com.tourapp.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "booking-service")
public interface BookingClient {
    
    @PutMapping("/api/bookings/{id}/confirm")
    ApiResponse<?> confirmBooking(@PathVariable("id") Long id);
}
