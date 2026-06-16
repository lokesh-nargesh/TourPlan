import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { TourPlanRequest } from '../models/tour-plan.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  constructor(private apiService: ApiService) {}

  createPlan(request: TourPlanRequest): Observable<any> {
    return this.apiService.post('/tours', request);
  }

  getPlansByUser(userId: number): Observable<any> {
    return this.apiService.get(`/tours/user/${userId}`);
  }

  getPlanById(id: number): Observable<any> {
    return this.apiService.get(`/tours/${id}`);
  }

  getItinerary(planId: number): Observable<any> {
    return this.apiService.get(`/tours/${planId}/itinerary`);
  }

  getBudgetBreakdown(planId: number): Observable<any> {
    return this.apiService.get(`/tours/${planId}/budget`);
  }

  updatePlanStatus(planId: number, status: string): Observable<any> {
    return this.apiService.put(`/tours/${planId}/status?status=${status}`, {});
  }
}
