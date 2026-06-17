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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
