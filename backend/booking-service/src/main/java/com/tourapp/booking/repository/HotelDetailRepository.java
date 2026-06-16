package com.tourapp.booking.repository;

import com.tourapp.booking.entity.HotelBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface HotelDetailRepository extends JpaRepository<HotelBookingDetail, Long> {
    Optional<HotelBookingDetail> findByBookingId(Long bookingId);
}
