package com.tourapp.tour.controller;

import com.tourapp.common.dto.ApiResponse;
import com.tourapp.tour.dto.TourPlanRequest;
import com.tourapp.tour.entity.BudgetBreakdown;
import com.tourapp.tour.entity.ItineraryItem;
import com.tourapp.tour.entity.TourPlan;
import com.tourapp.tour.service.TourPlanningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tours")
public class TourPlanController {

    private final TourPlanningService planningService;

    public TourPlanController(TourPlanningService planningService) {
        this.planningService = planningService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TourPlan>> createPlan(@RequestBody TourPlanRequest request) {
        TourPlan plan = planningService.createTourPlan(request);
        return ResponseEntity.ok(ApiResponse.success(plan, "Tour plan drafted successfully!"));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<TourPlan>>> getPlansByUserId(@PathVariable Long userId) {
        List<TourPlan> plans = planningService.getPlansByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(plans, "User tour plans retrieved."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TourPlan>> getPlanById(@PathVariable Long id) {
        TourPlan plan = planningService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success(plan, "Tour plan details retrieved."));
    }

    @GetMapping("/{id}/itinerary")
    public ResponseEntity<ApiResponse<List<ItineraryItem>>> getItinerary(@PathVariable Long id) {
        List<ItineraryItem> itinerary = planningService.getItinerariesByPlanId(id);
        return ResponseEntity.ok(ApiResponse.success(itinerary, "Day-wise itinerary retrieved."));
    }

    @GetMapping("/{id}/budget")
    public ResponseEntity<ApiResponse<List<BudgetBreakdown>>> getBudget(@PathVariable Long id) {
        List<BudgetBreakdown> budget = planningService.getBudgetByPlanId(id);
        return ResponseEntity.ok(ApiResponse.success(budget, "Budget breakdown retrieved."));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TourPlan>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        TourPlan plan = planningService.updatePlanStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(plan, "Tour plan status updated to " + status + "."));
    }

    @PostMapping("/{id}/budget/spent")
    public ResponseEntity<ApiResponse<String>> addSpentBudget(@PathVariable Long id,
                                                             @RequestParam String category,
                                                             @RequestParam Double amount) {
        planningService.updateBudgetSpent(id, category, amount);
        return ResponseEntity.ok(ApiResponse.success("Budget updated.", "Budget spent updated successfully."));
    }
}
