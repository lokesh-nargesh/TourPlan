package com.tourapp.tour.repository;

import com.tourapp.tour.entity.BudgetBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetBreakdownRepository extends JpaRepository<BudgetBreakdown, Long> {
    List<BudgetBreakdown> findByTourPlanId(Long tourPlanId);
    void deleteByTourPlanId(Long tourPlanId);
}
