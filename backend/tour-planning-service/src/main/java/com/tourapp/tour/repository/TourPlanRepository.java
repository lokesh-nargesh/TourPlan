package com.tourapp.tour.repository;

import com.tourapp.tour.entity.TourPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TourPlanRepository extends JpaRepository<TourPlan, Long> {
    List<TourPlan> findByUserId(Long userId);
}
