import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TourService } from '../../core/services/tour.service';
import { AuthService } from '../../core/services/auth.service';
import { TourPlan } from '../../core/models/tour-plan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container animate-fade-in">
      <!-- Welcome Header -->
      <div class="welcome-header">
        <div>
          <h1>Welcome, <span class="gradient-text">{{ username }}</span>!</h1>
          <p class="subtitle">Where would you like to travel next? Plan, track, and book your budget-friendly tour.</p>
        </div>
        <a routerLink="/planner" class="btn btn-primary">
          <span>+</span> Plan a New Trip
        </a>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid-cols-12 summary-grid">
        <div class="glass-panel summary-card col-4">
          <div class="card-icon cyan">🗺️</div>
          <div class="card-info">
            <h3>{{ plans.length }}</h3>
            <p>Total Tour Plans</p>
          </div>
        </div>

        <div class="glass-panel summary-card col-4">
          <div class="card-icon pink">💵</div>
          <div class="card-info">
            <h3>\${{ totalAllocatedBudget | number:'1.0-2' }}</h3>
            <p>Total Planned Budget</p>
          </div>
        </div>

        <div class="glass-panel summary-card col-4">
          <div class="card-icon purple">💰</div>
          <div class="card-info">
            <h3>\${{ totalSpentBudget | number:'1.0-2' }}</h3>
            <p>Total Spent Booking</p>
          </div>
        </div>
      </div>

      <!-- Main Contents Grid -->
      <div class="grid-cols-12 main-grid">
        <!-- Tour Plans List -->
        <div class="col-8 plans-section">
          <div class="section-title">
            <h2>Your Travel Itineraries</h2>
            <p>Drafts and confirmed vacations</p>
          </div>

          <div class="plans-list" *ngIf="plans.length > 0; else noPlans">
            <div class="glass-panel glass-panel-hover plan-item" *ngFor="let p of plans" (click)="viewPlan(p.id)">
              <div class="plan-main">
                <div class="plan-dest">{{ p.destination }}</div>
                <div class="plan-dates">📅 {{ p.startDate }} &rarr; {{ p.endDate }}</div>
              </div>
              
              <div class="plan-budget-status">
                <div class="plan-budget">
                  <span class="label">Budget:</span> \${{ p.totalBudget | number:'1.0-2' }}
                </div>
                <span class="badge" [ngClass]="{
                  'badge-info': p.status === 'DRAFT',
                  'badge-success': p.status === 'APPROVED',
                  'badge-warning': p.status === 'BOOKED'
                }">{{ p.status }}</span>
              </div>
            </div>
          </div>

          <ng-template #noPlans>
            <div class="glass-panel empty-card">
              <span class="empty-icon">🎒</span>
              <h3>No trips planned yet</h3>
              <p>Create your first custom itinerary to start booking flights, hotels, and taxis.</p>
              <a routerLink="/planner" class="btn btn-secondary">Get Started</a>
            </div>
          </ng-template>
        </div>

        <!-- Right Side: Travel Tips & Preferences -->
        <div class="col-4 side-section">
          <div class="glass-panel side-card">
            <h3>Quick Travel Tip</h3>
            <div class="tip-content">
              <span class="tip-bulb">💡</span>
              <p>Try allocating at least 15% of your travel budget to food and dining to sample the authentic local heritage dishes!</p>
            </div>
          </div>

          <div class="glass-panel side-card preference-card">
            <h3>Travel Preferences</h3>
            <p class="preference-desc">Update your profile to set default preferences (e.g. Flight/Train, Budget/Luxury, Vegan/Veg).</p>
            <a routerLink="/profile" class="btn btn-secondary btn-sm block-btn">Manage Preferences</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-header {
      display: flex;
      justify-content: justify;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      margin-top: 20px;
    }
    .subtitle {
      color: var(--text-secondary);
      margin-top: 6px;
      font-size: 1.05rem;
    }
    .summary-grid {
      margin-bottom: 40px;
    }
    .col-4 {
      grid-column: span 4;
    }
    .col-8 {
      grid-column: span 8;
    }
    .summary-card {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .card-icon {
      font-size: 2.2rem;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
    }
    .card-icon.cyan { color: var(--accent-cyan); box-shadow: inset 0 0 12px rgba(6, 182, 212, 0.1); }
    .card-icon.pink { color: var(--accent-secondary); box-shadow: inset 0 0 12px rgba(236, 72, 153, 0.1); }
    .card-icon.purple { color: var(--accent-primary); box-shadow: inset 0 0 12px rgba(99, 102, 241, 0.1); }
    
    .card-info h3 {
      font-size: 1.6rem;
      font-family: var(--font-display);
    }
    .card-info p {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
    .section-title {
      margin-bottom: 20px;
    }
    .section-title p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .plans-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .plan-item {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .plan-dest {
      font-size: 1.2rem;
      font-family: var(--font-display);
      font-weight: 600;
      color: var(--text-primary);
    }
    .plan-dates {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .plan-budget-status {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }
    .plan-budget {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .plan-budget .label {
      color: var(--text-secondary);
      font-weight: 400;
      font-size: 0.85rem;
    }
    
    .empty-card {
      padding: 60px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .empty-icon {
      font-size: 3.5rem;
    }
    .empty-card p {
      color: var(--text-secondary);
      max-width: 420px;
      margin-bottom: 12px;
    }
    
    .side-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .side-card {
      padding: 24px;
    }
    .side-card h3 {
      font-size: 1.1rem;
      margin-bottom: 16px;
    }
    .tip-content {
      display: flex;
      gap: 12px;
    }
    .tip-bulb {
      font-size: 1.5rem;
    }
    .tip-content p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .preference-card h3 {
      margin-bottom: 8px;
    }
    .preference-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 16px;
    }
    .block-btn {
      width: 100%;
      text-align: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  username = '';
  plans: TourPlan[] = [];
  
  totalAllocatedBudget = 0;
  totalSpentBudget = 0;

  constructor(
    private authService: AuthService,
    private tourService: TourService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserValue;
    if (user) {
      this.username = user.username;
      this.loadTourPlans(user.id);
    }
  }

  loadTourPlans(userId: number) {
    this.tourService.getPlansByUser(userId).subscribe(res => {
      if (res && res.success) {
        this.plans = res.data;
        this.calculateStats();
      }
    });
  }

  calculateStats() {
    this.totalAllocatedBudget = this.plans.reduce((acc, p) => acc + p.totalBudget, 0);
    
    // For each plan, fetch budget breakdown to calculate total spent
    this.totalSpentBudget = 0;
    this.plans.forEach(p => {
      this.tourService.getBudgetBreakdown(p.id).subscribe(res => {
        if (res && res.success) {
          const breakdown = res.data;
          const planSpent = breakdown.reduce((acc: number, item: any) => acc + item.spentAmount, 0);
          this.totalSpentBudget += planSpent;
        }
      });
    });
  }

  viewPlan(planId: number) {
    this.router.navigate(['/planner'], { queryParams: { planId } });
  }
}
