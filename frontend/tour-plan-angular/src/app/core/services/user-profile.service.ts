import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { UserProfile, Passenger } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  constructor(private apiService: ApiService) {}

  getProfile(userId: number): Observable<any> {
    return this.apiService.get(`/users/profile/${userId}`);
  }

  updateProfile(userId: number, profile: UserProfile): Observable<any> {
    return this.apiService.put(`/users/profile/${userId}`, profile);
  }

  getPassengers(userId: number): Observable<any> {
    return this.apiService.get(`/users/passengers/${userId}`);
  }

  addPassenger(userId: number, passenger: Passenger): Observable<any> {
    return this.apiService.post(`/users/passengers/${userId}`, passenger);
  }

  deletePassenger(userId: number, passengerId: number): Observable<any> {
    return this.apiService.delete(`/users/passengers/${userId}/${passengerId}`);
  }
}
