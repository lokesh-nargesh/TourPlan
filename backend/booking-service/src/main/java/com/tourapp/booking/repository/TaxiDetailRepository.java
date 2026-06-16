package com.tourapp.booking.repository;

import com.tourapp.booking.entity.TaxiBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaxiDetailRepository extends JpaRepository<TaxiBookingDetail, Long> {
    Optional<TaxiBookingDetail> findByBookingId(Long bookingId);
}
