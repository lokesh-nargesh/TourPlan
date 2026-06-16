package com.tourapp.tour.service;

import com.tourapp.common.exception.ResourceNotFoundException;
import com.tourapp.tour.dto.TourPlanRequest;
import com.tourapp.tour.entity.BudgetBreakdown;
import com.tourapp.tour.entity.ItineraryItem;
import com.tourapp.tour.entity.TourPlan;
import com.tourapp.tour.repository.BudgetBreakdownRepository;
import com.tourapp.tour.repository.ItineraryItemRepository;
import com.tourapp.tour.repository.TourPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class TourPlanningService {

    private final TourPlanRepository tourPlanRepository;
    private final ItineraryItemRepository itineraryRepository;
    private final BudgetBreakdownRepository budgetRepository;

    public TourPlanningService(TourPlanRepository tourPlanRepository,
                               ItineraryItemRepository itineraryRepository,
                               BudgetBreakdownRepository budgetRepository) {
        this.tourPlanRepository = tourPlanRepository;
        this.itineraryRepository = itineraryRepository;
        this.budgetRepository = budgetRepository;
    }

    @Transactional
    public TourPlan createTourPlan(TourPlanRequest request) {
        long daysCount = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (daysCount <= 0) {
            throw new IllegalArgumentException("End date must be after or equal to start date.");
        }

        // 1. Create Tour Plan
        TourPlan plan = TourPlan.builder()
                .userId(request.getUserId())
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalBudget(request.getTotalBudget())
                .estimatedCost(0.0) // calculated below
                .status("DRAFT")
                .build();

        TourPlan savedPlan = tourPlanRepository.save(plan);

        // 2. Generate Day-Wise Itineraries based on Destination
        List<ItineraryItem> itineraries = generateItineraries(savedPlan.getId(), request.getDestination(), (int) daysCount, request.getTotalBudget());
        itineraryRepository.saveAll(itineraries);

        // Calculate estimated cost from activities
        double estimatedCost = itineraries.stream().mapToDouble(ItineraryItem::getEstimatedCost).sum();
        savedPlan.setEstimatedCost(estimatedCost);
        tourPlanRepository.save(savedPlan);

        // 3. Generate Budget Breakdown (Flight: 30%, Hotel: 35%, Train: 5%, Taxi: 10%, Food: 15%, Misc: 5%)
        List<BudgetBreakdown> breakdowns = new ArrayList<>();
        double budget = request.getTotalBudget();

        breakdowns.add(createBreakdown(savedPlan.getId(), "FLIGHT", budget * 0.30));
        breakdowns.add(createBreakdown(savedPlan.getId(), "HOTEL", budget * 0.35));
        breakdowns.add(createBreakdown(savedPlan.getId(), "TRAIN", budget * 0.05));
        breakdowns.add(createBreakdown(savedPlan.getId(), "TAXI", budget * 0.10));
        breakdowns.add(createBreakdown(savedPlan.getId(), "FOOD", budget * 0.15));
        breakdowns.add(createBreakdown(savedPlan.getId(), "MISC", budget * 0.05));

        budgetRepository.saveAll(breakdowns);

        return savedPlan;
    }

    public List<TourPlan> getPlansByUserId(Long userId) {
        return tourPlanRepository.findByUserId(userId);
    }

    public TourPlan getPlanById(Long id) {
        return tourPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour Plan not found with id " + id));
    }

    public List<ItineraryItem> getItinerariesByPlanId(Long planId) {
        return itineraryRepository.findByTourPlanId(planId);
    }

    public List<BudgetBreakdown> getBudgetByPlanId(Long planId) {
        return budgetRepository.findByTourPlanId(planId);
    }

    @Transactional
    public TourPlan updatePlanStatus(Long id, String status) {
        TourPlan plan = getPlanById(id);
        plan.setStatus(status.toUpperCase());
        return tourPlanRepository.save(plan);
    }

    @Transactional
    public void updateBudgetSpent(Long tourPlanId, String category, Double amount) {
        List<BudgetBreakdown> breakdowns = budgetRepository.findByTourPlanId(tourPlanId);
        for (BudgetBreakdown breakdown : breakdowns) {
            if (breakdown.getCategory().equalsIgnoreCase(category)) {
                breakdown.setSpentAmount(breakdown.getSpentAmount() + amount);
                budgetRepository.save(breakdown);
                break;
            }
        }
    }

    private BudgetBreakdown createBreakdown(Long planId, String category, double allocated) {
        return BudgetBreakdown.builder()
                .tourPlanId(planId)
                .category(category)
                .allocatedAmount(allocated)
                .spentAmount(0.0)
                .build();
    }

    private List<ItineraryItem> generateItineraries(Long planId, String destination, int days, double totalBudget) {
        List<ItineraryItem> items = new ArrayList<>();
        double budgetPerDay = (totalBudget * 0.20) / days; // 20% of total budget allocated for day-wise sight-seeing and tickets

        String dest = destination.toLowerCase().trim();

        for (int i = 1; i <= days; i++) {
            String title;
            String desc;

            if (dest.contains("paris")) {
                switch (i % 3) {
                    case 1:
                        title = "Eiffel Tower & Seine Cruise";
                        desc = "Visit the iconic Eiffel Tower and take a scenic boat cruise along the Seine River to see historic Parisian monuments.";
                        break;
                    case 2:
                        title = "Louvre Museum & Tuileries Gardens";
                        desc = "Explore the largest art museum in the world, viewing masterpieces like the Mona Lisa, followed by a stroll in Tuileries.";
                        break;
                    default:
                        title = "Palace of Versailles Day Trip";
                        desc = "Travel to the outskirts of Paris to marvel at the grand Palace of Versailles and its breathtaking gardens.";
                        break;
                }
            } else if (dest.contains("tokyo")) {
                switch (i % 3) {
                    case 1:
                        title = "Senso-ji Temple & Akihabara District";
                        desc = "Explore Tokyo's oldest Buddhist temple in Asakusa, followed by shopping for electronics and anime culture in Akihabara.";
                        break;
                    case 2:
                        title = "Shibuya Crossing & Meiji Shrine";
                        desc = "Walk across the famous Shibuya Crossing, shop around Harajuku, and find peace at the tranquil Meiji Shinto Shrine.";
                        break;
                    default:
                        title = "TeamLab Planets & Odaiba Bay";
                        desc = "Immerse yourself in digital art at TeamLab Planets and enjoy futuristic waterfront views in Odaiba.";
                        break;
                }
            } else if (dest.contains("new york") || dest.contains("ny")) {
                switch (i % 3) {
                    case 1:
                        title = "Statue of Liberty & Wall Street";
                        desc = "Take the ferry to Liberty Island, visit Ellis Island, and walk through the Financial District and 9/11 Memorial.";
                        break;
                    case 2:
                        title = "Central Park & Times Square";
                        desc = "Rent a bike in Central Park, visit the Metropolitan Museum of Art, and watch the bright Broadway lights at Times Square.";
                        break;
                    default:
                        title = "Empire State Building & High Line";
                        desc = "Ascend the Empire State Building for skyline views and walk along the High Line elevated park in Chelsea.";
                        break;
                }
            } else {
                // Generic beautiful itinerary generator
                switch (i % 3) {
                    case 1:
                        title = "City Heritage & Landmark Tour";
                        desc = "Embark on a guided tour of the historic city center, capturing photographs of key landmarks and architecture.";
                        break;
                    case 2:
                        title = "Local Culture, Art & Museums";
                        desc = "Delve into the local history at the primary museums and art galleries, followed by a lunch tasting local cuisines.";
                        break;
                    default:
                        title = "Nature Escape & Scenic Day Out";
                        desc = "Take a break from the urban environment with a trip to the nearest national park, beach, or mountain viewpoint.";
                        break;
                }
            }

            items.add(ItineraryItem.builder()
                    .tourPlanId(planId)
                    .dayNumber(i)
                    .activityTitle("Day " + i + ": " + title)
                    .description(desc)
                    .estimatedCost(budgetPerDay)
                    .build());
        }

        return items;
    }
}
