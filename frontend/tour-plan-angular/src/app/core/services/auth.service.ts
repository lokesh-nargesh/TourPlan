import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthResponse | null>;
  public currentUser: Observable<AuthResponse | null>;

  constructor(private apiService: ApiService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.apiService.post<any>('/auth/login', { username, password })
      .pipe(map(response => {
        if (response && response.success && response.data) {
          const user: AuthResponse = response.data;
          localStorage.setItem('token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return response;
      }));
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.apiService.post<any>('/auth/register', { username, email, password, role: 'USER' })
      .pipe(map(response => {
        if (response && response.success && response.data) {
          const user: AuthResponse = response.data;
          localStorage.setItem('token', user.token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return response;
      }));
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
