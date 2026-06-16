package com.tourapp.booking.repository;

import com.tourapp.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByTourPlanId(Long tourPlanId);
    List<Booking> findByUserId(Long userId);
}
