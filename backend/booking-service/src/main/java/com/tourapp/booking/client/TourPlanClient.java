package com.tourapp.booking.client;

import com.tourapp.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "tour-planning-service")
public interface TourPlanClient {
    
    @PostMapping("/api/tours/{id}/budget/spent")
    ApiResponse<String> addSpentBudget(@PathVariable("id") Long id,
                                      @RequestParam("category") String category,
                                      @RequestParam("amount") Double amount);
}
