package com.tourapp.user.repository;

import com.tourapp.user.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    List<Passenger> findByUserId(Long userId);
}
