package com.tourapp.booking.repository;

import com.tourapp.booking.entity.FlightBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FlightDetailRepository extends JpaRepository<FlightBookingDetail, Long> {
    Optional<FlightBookingDetail> findByBookingId(Long bookingId);
}
