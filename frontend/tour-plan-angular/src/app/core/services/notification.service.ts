import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private apiService: ApiService) {}

  getNotifications(userId: number): Observable<any> {
    return this.apiService.get(`/notifications/user/${userId}`);
  }

  sendNotification(userId: number, title: string, message: string, type: 'EMAIL' | 'SMS' | 'PUSH'): Observable<any> {
    return this.apiService.post('/notifications', {
      userId,
      title,
      message,
      type
    });
  }
}
