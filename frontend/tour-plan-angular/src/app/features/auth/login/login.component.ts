import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper animate-fade-in">
      <div class="glass-panel auth-card">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to resume planning your next adventure</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="alert alert-danger" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" formControlName="username" class="form-control" placeholder="Enter your username" autocomplete="username">
            <div class="error-msg" *ngIf="f['username'].touched && f['username'].invalid">
              Username is required.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" autocomplete="current-password">
            <div class="error-msg" *ngIf="f['password'].touched && f['password'].invalid">
              Password is required.
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || loading" class="btn btn-primary btn-block">
            <span class="spinner" *ngIf="loading"></span>
            <span *ngIf="!loading">Login</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 180px);
      padding: 40px 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 40px;
      border-radius: var(--border-radius-lg);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-header h2 {
      font-size: 2rem;
      margin-bottom: 8px;
    }
    .auth-header p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .btn-block {
      width: 100%;
      margin-top: 10px;
    }
    .error-msg {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 6px;
    }
    .alert {
      padding: 12px 16px;
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      margin-bottom: 8px;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
    }
    .auth-footer {
      text-align: center;
      margin-top: 32px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .auth-footer a {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 600;
    }
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage = res.message || 'Login failed.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid username or password.';
        this.loading = false;
      }
    });
  }
}
