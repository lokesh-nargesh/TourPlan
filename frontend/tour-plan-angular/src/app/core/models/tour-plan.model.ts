export interface TourPlan {
  id: number;
  userId: number;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalBudget: number;
  estimatedCost: number;
  status: 'DRAFT' | 'APPROVED' | 'BOOKED';
}

export interface ItineraryItem {
  id?: number;
  tourPlanId: number;
  dayNumber: number;
  activityTitle: string;
  description: string;
  estimatedCost: number;
}

export interface BudgetBreakdown {
  id?: number;
  tourPlanId: number;
  category: 'FLIGHT' | 'HOTEL' | 'TRAIN' | 'TAXI' | 'FOOD' | 'MISC';
  allocatedAmount: number;
  spentAmount: number;
}

export interface TourPlanRequest {
  userId: number;
  destination: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
}
