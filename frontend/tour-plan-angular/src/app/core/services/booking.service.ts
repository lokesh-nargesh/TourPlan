import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { BookingRequest } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  constructor(private apiService: ApiService) {}

  searchFlights(from: string, to: string): Observable<any> {
    return this.apiService.get(`/bookings/flights/search?from=${from}&to=${to}`);
  }

  searchHotels(city: string): Observable<any> {
    return this.apiService.get(`/bookings/hotels/search?city=${city}`);
  }

  searchTrains(from: string, to: string): Observable<any> {
    return this.apiService.get(`/bookings/trains/search?from=${from}&to=${to}`);
  }

  searchTaxis(location: string): Observable<any> {
    return this.apiService.get(`/bookings/taxis/search?location=${location}`);
  }

  createBooking(request: BookingRequest): Observable<any> {
    return this.apiService.post('/bookings', request);
  }

  getBookingsByPlan(tourPlanId: number): Observable<any> {
    return this.apiService.get(`/bookings/tour/${tourPlanId}`);
  }

  cancelBooking(bookingId: number): Observable<any> {
    return this.apiService.put(`/bookings/${bookingId}/cancel`, {});
  }
}
