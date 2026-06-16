package com.tourapp.tour.repository;

import com.tourapp.tour.entity.ItineraryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItineraryItemRepository extends JpaRepository<ItineraryItem, Long> {
    List<ItineraryItem> findByTourPlanId(Long tourPlanId);
    void deleteByTourPlanId(Long tourPlanId);
}
