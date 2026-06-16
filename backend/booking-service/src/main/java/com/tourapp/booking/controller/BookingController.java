package com.tourapp.booking.controller;

import com.tourapp.booking.dto.BookingRequest;
import com.tourapp.booking.dto.BookingResponse;
import com.tourapp.booking.entity.Booking;
import com.tourapp.booking.service.BookingService;
import com.tourapp.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@RequestBody BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking processed successfully!"));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Booking>> confirmBooking(@PathVariable Long id) {
        Booking booking = bookingService.confirmBooking(id);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking confirmed successfully."));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking cancelled successfully."));
    }

    @GetMapping("/tour/{tourPlanId}")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingsByPlan(@PathVariable Long tourPlanId) {
        List<BookingResponse> responses = bookingService.getBookingsByPlan(tourPlanId);
        return ResponseEntity.ok(ApiResponse.success(responses, "Bookings list retrieved for tour plan."));
    }

    // Search Routes
    @GetMapping("/flights/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchFlights(@RequestParam String from,
                                                                               @RequestParam String to) {
        List<Map<String, Object>> flights = bookingService.searchFlights(from, to);
        return ResponseEntity.ok(ApiResponse.success(flights, "Flights searched successfully."));
    }

    @GetMapping("/hotels/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchHotels(@RequestParam String city) {
        List<Map<String, Object>> hotels = bookingService.searchHotels(city);
        return ResponseEntity.ok(ApiResponse.success(hotels, "Hotels searched successfully."));
    }

    @GetMapping("/trains/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchTrains(@RequestParam String from,
                                                                              @RequestParam String to) {
        List<Map<String, Object>> trains = bookingService.searchTrains(from, to);
        return ResponseEntity.ok(ApiResponse.success(trains, "Trains searched successfully."));
    }

    @GetMapping("/taxis/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchTaxis(@RequestParam String location) {
        List<Map<String, Object>> taxis = bookingService.searchTaxis(location);
        return ResponseEntity.ok(ApiResponse.success(taxis, "Taxis searched successfully."));
    }
}
