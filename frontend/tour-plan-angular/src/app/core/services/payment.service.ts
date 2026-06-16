import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private apiService: ApiService) {}

  processPayment(bookingId: number, userId: number, amount: number, method: string, cardNumber?: string, expiryDate?: string, cvv?: string): Observable<any> {
    return this.apiService.post('/payments', {
      bookingId,
      userId,
      amount,
      paymentMethod: method,
      cardNumber,
      expiryDate,
      cvv
    });
  }

  getPaymentDetails(bookingId: number): Observable<any> {
    return this.apiService.get(`/payments/booking/${bookingId}`);
  }
}
