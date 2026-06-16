package com.tourapp.booking.repository;

import com.tourapp.booking.entity.TrainBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TrainDetailRepository extends JpaRepository<TrainBookingDetail, Long> {
    Optional<TrainBookingDetail> findByBookingId(Long bookingId);
}
