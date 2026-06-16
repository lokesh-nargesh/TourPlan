import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TourService } from '../../core/services/tour.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { TourPlan, ItineraryItem, BudgetBreakdown } from '../../core/models/tour-plan.model';
import { BookingResponse } from '../../core/models/booking.model';

@Component({
  selector: 'app-tour-planner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <div class="app-container animate-fade-in">
      <!-- 1. WIZARD STEP: CREATE DRAFT TOUR PLAN -->
      <div class="glass-panel form-card" *ngIf="!selectedPlan">
        <div class="form-header">
          <h2>Create Tour Plan</h2>
          <p>Set your destination, dates, and budget. Our planner will generate a custom itinerary.</p>
        </div>

        <form [formGroup]="planForm" (ngSubmit)="onCreatePlan()" class="planner-form">
          <div class="form-group">
            <label class="form-label">Destination</label>
            <input type="text" formControlName="destination" class="form-control" placeholder="e.g. Paris, Tokyo, Goa, London">
            <div class="error-msg" *ngIf="pf['destination'].touched && pf['destination'].invalid">
              Destination is required.
            </div>
          </div>

          <div class="date-row">
            <div class="form-group col-6">
              <label class="form-label">Start Date</label>
              <input type="date" formControlName="startDate" class="form-control">
              <div class="error-msg" *ngIf="pf['startDate'].touched && pf['startDate'].invalid">
                Start date is required.
              </div>
            </div>
            <div class="form-group col-6">
              <label class="form-label">End Date</label>
              <input type="date" formControlName="endDate" class="form-control">
              <div class="error-msg" *ngIf="pf['endDate'].touched && pf['endDate'].invalid">
                End date is required.
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Total Budget ($)</label>
            <input type="number" formControlName="totalBudget" class="form-control" placeholder="e.g. 2500">
            <div class="error-msg" *ngIf="pf['totalBudget'].touched && pf['totalBudget'].invalid">
              Please enter a valid budget (> 0).
            </div>
          </div>

          <button type="submit" [disabled]="planForm.invalid || creating" class="btn btn-primary block-btn">
            <span class="spinner" *ngIf="creating"></span>
            <span *ngIf="!creating">Generate Custom Itinerary</span>
          </button>
        </form>
      </div>

      <!-- 2. DETAILS VIEW: ITINERARY, BUDGETS, BOOKINGS -->
      <div *ngIf="selectedPlan" class="plan-details-view">
        <!-- Navigation / Header -->
        <div class="details-header">
          <button (click)="goBack()" class="btn btn-secondary btn-sm">&larr; Back to Dashboard</button>
          <div class="plan-meta">
            <h1>Itinerary for <span class="gradient-text">{{ selectedPlan.destination }}</span></h1>
            <p class="subtitle">📅 {{ selectedPlan.startDate }} to {{ selectedPlan.endDate }} | Budget: \${{ selectedPlan.totalBudget | number:'1.0-2' }}</p>
          </div>
        </div>

        <div class="grid-cols-12 plan-grid">
          <!-- Left 7 Columns: Day-wise Itinerary -->
          <div class="col-7 itinerary-section">
            <div class="glass-panel card-section">
              <h2>Day-by-Day Schedule</h2>
              <div class="itinerary-timeline">
                <div class="timeline-item" *ngFor="let item of itinerary">
                  <div class="timeline-badge">{{ item.dayNumber }}</div>
                  <div class="timeline-content">
                    <h3>{{ item.activityTitle }}</h3>
                    <p class="desc">{{ item.description }}</p>
                    <div class="cost-tag">Est. Cost: \${{ item.estimatedCost | number:'1.0-2' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right 5 Columns: Budgets & Bookings -->
          <div class="col-5 budget-booking-section">
            <!-- Budget Breakdown -->
            <div class="glass-panel card-section budget-card">
              <h2>Budget Allocation & Spending</h2>
              <div class="budget-list">
                <div class="budget-item" *ngFor="let b of budget">
                  <div class="budget-meta">
                    <span class="category">{{ b.category }}</span>
                    <span class="values">\${{ b.spentAmount | number:'1.0-2' }} / \${{ b.allocatedAmount | number:'1.0-2' }}</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" [style.width.%]="getProgressPercent(b.spentAmount, b.allocatedAmount)"
                         [ngClass]="{
                           'fill-success': b.spentAmount <= b.allocatedAmount,
                           'fill-danger': b.spentAmount > b.allocatedAmount
                         }">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Bookings List / Search Panel -->
            <div class="glass-panel card-section bookings-card">
              <h2>Book Services</h2>
              <div class="booking-buttons">
                <button (click)="openSearch('FLIGHT')" class="btn btn-secondary btn-sm"><span class="btn-icon">✈</span> Flight</button>
                <button (click)="openSearch('HOTEL')" class="btn btn-secondary btn-sm"><span class="btn-icon">🏨</span> Hotel</button>
                <button (click)="openSearch('TRAIN')" class="btn btn-secondary btn-sm"><span class="btn-icon">🚆</span> Train</button>
                <button (click)="openSearch('TAXI')" class="btn btn-secondary btn-sm"><span class="btn-icon">🚕</span> Taxi</button>
              </div>

              <!-- Booked Services List -->
              <div class="booked-list">
                <h3>Current Bookings</h3>
                <div class="empty-bookings" *ngIf="bookings.length === 0">
                  No services booked yet.
                </div>
                <div class="booked-item" *ngFor="let b of bookings">
                  <div class="booked-meta">
                    <div>
                      <span class="type-badge">{{ b.booking.type }}</span>
                      <span class="ref-num">{{ b.booking.referenceNumber }}</span>
                    </div>
                    <span class="price">\${{ b.booking.price }}</span>
                  </div>
                  
                  <div class="booking-details">
                    <div *ngIf="b.flightDetail">
                      Flight: <strong>{{ b.flightDetail.flightNumber }}</strong> ({{ b.flightDetail.departureAirport }} &rarr; {{ b.flightDetail.arrivalAirport }})
                    </div>
                    <div *ngIf="b.hotelDetail">
                      Hotel: <strong>{{ b.hotelDetail.hotelName }}</strong> ({{ b.hotelDetail.roomType }})
                    </div>
                    <div *ngIf="b.trainDetail">
                      Train: <strong>{{ b.trainDetail.trainNumber }}</strong> (PNR: {{ b.trainDetail.pnr }})
                    </div>
                    <div *ngIf="b.taxiDetail">
                      Taxi: <strong>{{ b.taxiDetail.taxiType }}</strong> - Driver: {{ b.taxiDetail.driverName }}
                    </div>
                  </div>

                  <div class="booked-status-actions">
                    <span class="badge" [ngClass]="{
                      'badge-warning': b.booking.status === 'PENDING',
                      'badge-success': b.booking.status === 'CONFIRMED',
                      'badge-danger': b.booking.status === 'CANCELLED'
                    }">{{ b.booking.status }}</span>
                    
                    <div class="actions">
                      <button *ngIf="b.booking.status === 'PENDING'" (click)="openCheckout(b)" class="btn btn-primary btn-xs">Pay Now</button>
                      <button *ngIf="b.booking.status === 'CONFIRMED'" (click)="cancelBooking(b.booking.id)" class="btn btn-danger btn-xs">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MOCK SEARCH MODALS / FORMS -->
      <div class="modal-backdrop" *ngIf="currentSearchType">
        <div class="glass-panel modal-card">
          <div class="modal-header">
            <h2>Book {{ currentSearchType }}</h2>
            <button class="close-btn" (click)="closeSearch()">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Search inputs depending on booking type -->
            <div class="search-form-row">
              <div class="form-group col-6" *ngIf="currentSearchType === 'FLIGHT' || currentSearchType === 'TRAIN'">
                <label class="form-label">From</label>
                <input type="text" [(ngModel)]="searchFrom" class="form-control" placeholder="Source City">
              </div>
              <div class="form-group col-6" *ngIf="currentSearchType === 'FLIGHT' || currentSearchType === 'TRAIN'">
                <label class="form-label">To</label>
                <input type="text" [(ngModel)]="searchTo" class="form-control" placeholder="Destination City">
              </div>
              <div class="form-group col-12" *ngIf="currentSearchType === 'HOTEL'">
                <label class="form-label">City / Destination</label>
                <input type="text" [(ngModel)]="searchCity" class="form-control" placeholder="e.g. Paris">
              </div>
              <div class="form-group col-12" *ngIf="currentSearchType === 'TAXI'">
                <label class="form-label">Pickup Location</label>
                <input type="text" [(ngModel)]="searchTaxiLoc" class="form-control" placeholder="Pickup Address">
              </div>
            </div>

            <button (click)="executeSearch()" class="btn btn-primary block-btn">Search Options</button>

            <!-- Search Results -->
            <div class="search-results" *ngIf="searchResults.length > 0">
              <h3>Available Options</h3>
              <div class="result-list">
                <div class="result-item" *ngFor="let res of searchResults">
                  <div class="result-main">
                    <div class="title" *ngIf="currentSearchType === 'FLIGHT'">{{ res.airline }} ({{ res.flightNumber }})</div>
                    <div class="title" *ngIf="currentSearchType === 'HOTEL'">{{ res.hotelName }} ({{ res.rating }} ⭐)</div>
                    <div class="title" *ngIf="currentSearchType === 'TRAIN'">{{ res.trainName }} ({{ res.trainNumber }})</div>
                    <div class="title" *ngIf="currentSearchType === 'TAXI'">{{ res.taxiType }} Cabs</div>
                    
                    <div class="sub" *ngIf="currentSearchType === 'FLIGHT'">Departure: {{ res.departureTime }} | Arrival: {{ res.arrivalTime }}</div>
                    <div class="sub" *ngIf="currentSearchType === 'HOTEL'">{{ res.roomType }} - {{ res.address }}</div>
                    <div class="sub" *ngIf="currentSearchType === 'TRAIN'">Departure: {{ res.departureTime }} | Class: {{ res.coachClass }}</div>
                    <div class="sub" *ngIf="currentSearchType === 'TAXI'">Driver: {{ res.driverName }} ({{ res.estimatedTime }} away)</div>
                  </div>

                  <div class="result-action">
                    <span class="price">\${{ res.price }}</span>
                    <button (click)="selectResult(res)" class="btn btn-primary btn-sm">Book</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. CHECKOUT PAYMENT MODAL -->
      <div class="modal-backdrop" *ngIf="checkoutBooking">
        <div class="glass-panel modal-card max-440">
          <div class="modal-header">
            <h2>Process Payment</h2>
            <button class="close-btn" (click)="checkoutBooking = null">&times;</button>
          </div>
          <div class="modal-body">
            <div class="bill-summary glass-panel">
              <div class="bill-row">
                <span>Booking Reference:</span>
                <strong>{{ checkoutBooking.booking.referenceNumber }}</strong>
              </div>
              <div class="bill-row">
                <span>Subtotal:</span>
                <span>\${{ checkoutBooking.booking.price | number:'1.2-2' }}</span>
              </div>
              <div class="bill-row">
                <span>Taxes & GST (18%):</span>
                <span>\${{ (checkoutBooking.booking.price * 0.18) | number:'1.2-2' }}</span>
              </div>
              <div class="bill-row divider"></div>
              <div class="bill-row total">
                <span>Total Amount:</span>
                <span>\${{ (checkoutBooking.booking.price * 1.18) | number:'1.2-2' }}</span>
              </div>
            </div>

            <form [formGroup]="paymentForm" (ngSubmit)="payNow()" class="payment-form">
              <div class="form-group">
                <label class="form-label">Payment Method</label>
                <select formControlName="paymentMethod" class="form-control">
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="NETBANKING">Net Banking</option>
                </select>
              </div>

              <div *ngIf="paymentForm.get('paymentMethod')?.value === 'CARD'">
                <div class="form-group">
                  <label class="form-label">Card Number</label>
                  <input type="text" formControlName="cardNumber" class="form-control" placeholder="1234 5678 9876 5432">
                </div>
                <div class="date-row">
                  <div class="form-group col-6">
                    <label class="form-label">Expiry Date</label>
                    <input type="text" formControlName="expiryDate" class="form-control" placeholder="MM/YY">
                  </div>
                  <div class="form-group col-6">
                    <label class="form-label">CVV</label>
                    <input type="password" formControlName="cvv" class="form-control" placeholder="123">
                  </div>
                </div>
              </div>

              <button type="submit" [disabled]="paymentForm.invalid || paying" class="btn btn-primary block-btn">
                <span class="spinner" *ngIf="paying"></span>
                <span *ngIf="!paying">Pay Securely</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-card {
      max-width: 600px;
      margin: 40px auto;
      padding: 40px;
      border-radius: var(--border-radius-lg);
    }
    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .form-header h2 {
      font-size: 1.8rem;
      margin-bottom: 8px;
    }
    .form-header p {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .planner-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .date-row {
      display: flex;
      gap: 16px;
    }
    .col-6 {
      flex: 1;
    }
    .col-12 {
      width: 100%;
    }
    .block-btn {
      width: 100%;
    }
    .error-msg {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 6px;
    }
    
    /* DETAILS VIEW STYLES */
    .details-header {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
      margin-top: 20px;
    }
    .plan-meta h1 {
      font-size: 2.2rem;
    }
    .plan-meta .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      margin-top: 4px;
    }
    .plan-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 24px;
    }
    .col-7 {
      grid-column: span 7;
    }
    .col-5 {
      grid-column: span 5;
    }
    .card-section {
      padding: 24px;
      margin-bottom: 24px;
      border-radius: var(--border-radius-md);
    }
    .card-section h2 {
      font-size: 1.25rem;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 10px;
    }
    
    /* TIMELINE */
    .itinerary-timeline {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: relative;
      padding-left: 20px;
      border-left: 1px solid var(--glass-border);
    }
    .timeline-item {
      position: relative;
    }
    .timeline-badge {
      position: absolute;
      left: -33px;
      top: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      box-shadow: 0 0 10px var(--accent-primary-glow);
    }
    .timeline-content {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--glass-border);
      padding: 16px;
      border-radius: var(--border-radius-sm);
    }
    .timeline-content h3 {
      font-size: 1.05rem;
      margin-bottom: 8px;
    }
    .timeline-content .desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.4;
    }
    .cost-tag {
      display: inline-block;
      margin-top: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--accent-cyan);
      background: rgba(6, 182, 212, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }

    /* BUDGET PROGRESS */
    .budget-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .budget-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .budget-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .budget-meta .category {
      font-weight: 600;
      color: var(--text-primary);
    }
    .budget-meta .values {
      color: var(--text-secondary);
    }
    .progress-bar-bg {
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease-in-out;
    }
    .fill-success { background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-cyan) 100%); }
    .fill-danger { background: var(--color-danger); }

    /* BOOKINGS SECTION */
    .booking-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .btn-icon {
      font-size: 1rem;
    }
    .booked-list h3 {
      font-size: 1rem;
      margin-bottom: 12px;
      color: var(--text-secondary);
    }
    .empty-bookings {
      font-size: 0.85rem;
      color: var(--text-muted);
      padding: 12px 0;
    }
    .booked-item {
      border: 1px solid var(--glass-border);
      background: rgba(255, 255, 255, 0.01);
      padding: 16px;
      border-radius: var(--border-radius-sm);
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .booked-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .type-badge {
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      margin-right: 8px;
    }
    .ref-num {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .booked-meta .price {
      font-weight: 700;
      color: var(--accent-cyan);
    }
    .booking-details {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .booked-status-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }
    .btn-xs {
      padding: 4px 10px;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
    }
    .booked-status-actions .actions {
      display: flex;
      gap: 8px;
    }

    /* MODALS */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-card {
      width: 90%;
      max-width: 600px;
      padding: 30px;
      border-radius: var(--border-radius-md);
      position: relative;
    }
    .max-440 {
      max-width: 440px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 10px;
    }
    .modal-header h2 {
      font-size: 1.4rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.8rem;
      cursor: pointer;
      line-height: 1;
    }
    .search-form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }
    .search-results {
      margin-top: 24px;
      max-height: 250px;
      overflow-y: auto;
    }
    .search-results h3 {
      font-size: 0.95rem;
      color: var(--text-secondary);
      margin-bottom: 12px;
    }
    .result-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--glass-border);
      padding: 12px;
      border-radius: var(--border-radius-sm);
    }
    .result-main .title {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .result-main .sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .result-action {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .result-action .price {
      font-weight: 700;
      font-size: 0.95rem;
    }
    
    /* CHECKOUT SUMMARY */
    .bill-summary {
      padding: 16px;
      margin-bottom: 20px;
    }
    .bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 8px;
    }
    .bill-row.divider {
      height: 1px;
      background: var(--glass-border);
      margin: 8px 0;
    }
    .bill-row.total {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--accent-cyan);
      margin-bottom: 0;
    }
    .payment-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `]
})
export class TourPlannerComponent implements OnInit {
  planForm!: FormGroup;
  paymentForm!: FormGroup;
  
  creating = false;
  paying = false;
  selectedPlan: TourPlan | null = null;
  itinerary: ItineraryItem[] = [];
  budget: BudgetBreakdown[] = [];
  bookings: BookingResponse[] = [];

  // Mock Search State
  currentSearchType: string | null = null;
  searchFrom = '';
  searchTo = '';
  searchCity = '';
  searchTaxiLoc = '';
  searchResults: any[] = [];

  // Checkout State
  checkoutBooking: BookingResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForms();

    // Check if planId is provided in URL
    this.route.queryParams.subscribe(params => {
      const planId = params['planId'];
      if (planId) {
        this.loadPlanDetails(Number(planId));
      }
    });
  }

  initForms() {
    this.planForm = this.fb.group({
      destination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalBudget: ['', [Validators.required, Validators.min(1)]]
    });

    this.paymentForm = this.fb.group({
      paymentMethod: ['CARD', Validators.required],
      cardNumber: [''],
      expiryDate: [''],
      cvv: ['']
    });

    // Make card validators conditional
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(val => {
      const cardControl = this.paymentForm.get('cardNumber');
      const expControl = this.paymentForm.get('expiryDate');
      const cvvControl = this.paymentForm.get('cvv');

      if (val === 'CARD') {
        cardControl?.setValidators([Validators.required]);
        expControl?.setValidators([Validators.required]);
        cvvControl?.setValidators([Validators.required]);
      } else {
        cardControl?.clearValidators();
        expControl?.clearValidators();
        cvvControl?.clearValidators();
      }
      cardControl?.updateValueAndValidity();
      expControl?.updateValueAndValidity();
      cvvControl?.updateValueAndValidity();
    });
  }

  get pf() { return this.planForm.controls; }

  loadPlanDetails(planId: number) {
    this.tourService.getPlanById(planId).subscribe(res => {
      if (res && res.success) {
        this.selectedPlan = res.data;
        this.loadItineraryAndBudget(planId);
        this.loadBookings(planId);
      }
    });
  }

  loadItineraryAndBudget(planId: number) {
    this.tourService.getItinerary(planId).subscribe(res => {
      if (res && res.success) this.itinerary = res.data;
    });
    this.tourService.getBudgetBreakdown(planId).subscribe(res => {
      if (res && res.success) this.budget = res.data;
    });
  }

  loadBookings(planId: number) {
    this.bookingService.getBookingsByPlan(planId).subscribe(res => {
      if (res && res.success) this.bookings = res.data;
    });
  }

  onCreatePlan() {
    if (this.planForm.invalid) return;
    this.creating = true;

    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    const request = {
      userId: user.id,
      ...this.planForm.value
    };

    this.tourService.createPlan(request).subscribe({
      next: (res) => {
        if (res && res.success) {
          const plan: TourPlan = res.data;
          
          // Send notification
          this.notificationService.sendNotification(user.id, 'New Itinerary Generated!', `A Day-by-Day plan for ${plan.destination} has been drafted.`, 'PUSH').subscribe();

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { planId: plan.id },
            queryParamsHandling: 'merge'
          });
        }
        this.creating = false;
      },
      error: () => this.creating = false
    });
  }

  getProgressPercent(spent: number, allocated: number): number {
    if (allocated === 0) return 0;
    const pct = (spent / allocated) * 100;
    return pct > 100 ? 100 : pct;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // BOOKING MOCK SECTIONS
  openSearch(type: string) {
    this.currentSearchType = type;
    this.searchResults = [];
    this.searchFrom = '';
    this.searchTo = '';
    this.searchCity = this.selectedPlan?.destination || '';
    this.searchTaxiLoc = this.selectedPlan?.destination || '';
  }

  closeSearch() {
    this.currentSearchType = null;
    this.searchResults = [];
  }

  executeSearch() {
    if (!this.currentSearchType) return;

    switch (this.currentSearchType) {
      case 'FLIGHT':
        this.bookingService.searchFlights(this.searchFrom || 'NYC', this.searchTo || 'PAR').subscribe(res => {
          if (res && res.success) this.searchResults = res.data;
        });
        break;
      case 'HOTEL':
        this.bookingService.searchHotels(this.searchCity || 'Paris').subscribe(res => {
          if (res && res.success) this.searchResults = res.data;
        });
        break;
      case 'TRAIN':
        this.bookingService.searchTrains(this.searchFrom || 'LON', this.searchTo || 'PAR').subscribe(res => {
          if (res && res.success) this.searchResults = res.data;
        });
        break;
      case 'TAXI':
        this.bookingService.searchTaxis(this.searchTaxiLoc || 'Airport').subscribe(res => {
          if (res && res.success) this.searchResults = res.data;
        });
        break;
    }
  }

  selectResult(item: any) {
    if (!this.selectedPlan) return;
    const user = this.authService.currentUserValue;
    if (!user) return;

    const request: any = {
      tourPlanId: this.selectedPlan.id,
      userId: user.id,
      type: this.currentSearchType!,
      price: item.price
    };

    // Populate DTO specific properties
    if (this.currentSearchType === 'FLIGHT') {
      request.flightNumber = item.flightNumber;
      request.departureAirport = item.departureAirport;
      request.arrivalAirport = item.arrivalAirport;
      request.departureTime = item.departureTime;
      request.arrivalTime = item.arrivalTime;
    } else if (this.currentSearchType === 'HOTEL') {
      request.hotelName = item.hotelName;
      request.roomType = item.roomType;
      request.checkInDate = this.selectedPlan.startDate;
      request.checkOutDate = this.selectedPlan.endDate;
      request.guestsCount = 2;
    } else if (this.currentSearchType === 'TRAIN') {
      request.trainNumber = item.trainNumber;
      request.sourceStation = item.sourceStation;
      request.destinationStation = item.destinationStation;
      request.coachClass = item.coachClass;
    } else if (this.currentSearchType === 'TAXI') {
      request.taxiType = item.taxiType;
      request.pickupLocation = item.pickupLocation;
      request.dropLocation = this.selectedPlan.destination;
      request.pickupTime = '10:00 AM';
    }

    this.bookingService.createBooking(request).subscribe(res => {
      if (res && res.success) {
        this.loadBookings(this.selectedPlan!.id);
        this.loadItineraryAndBudget(this.selectedPlan!.id);
        
        // Notify
        this.notificationService.sendNotification(user.id, `${this.currentSearchType} Booked (Pending Payment)`, `Your ${this.currentSearchType} booking reference ${res.data.booking.referenceNumber} has been added.`, 'PUSH').subscribe();

        this.closeSearch();
      }
    });
  }

  cancelBooking(bookingId: number) {
    if (!this.selectedPlan) return;
    const user = this.authService.currentUserValue;

    this.bookingService.cancelBooking(bookingId).subscribe(res => {
      if (res && res.success) {
        this.loadBookings(this.selectedPlan!.id);
        this.loadItineraryAndBudget(this.selectedPlan!.id);

        if (user) {
          this.notificationService.sendNotification(user.id, 'Booking Cancelled', `Booking reference ${res.data.referenceNumber} was successfully cancelled and refunded.`, 'PUSH').subscribe();
        }
      }
    });
  }

  // CHECKOUT PAYMENT
  openCheckout(booking: BookingResponse) {
    this.checkoutBooking = booking;
    this.paymentForm.patchValue({
      paymentMethod: 'CARD',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
  }

  payNow() {
    if (this.paymentForm.invalid || !this.checkoutBooking || !this.selectedPlan) return;

    this.paying = true;
    const user = this.authService.currentUserValue;
    if (!user) return;

    const { paymentMethod, cardNumber, expiryDate, cvv } = this.paymentForm.value;

    this.paymentService.processPayment(
      this.checkoutBooking.booking.id,
      user.id,
      this.checkoutBooking.booking.price,
      paymentMethod,
      cardNumber,
      expiryDate,
      cvv
    ).subscribe({
      next: (res) => {
        if (res && res.success) {
          // Success
          this.loadBookings(this.selectedPlan!.id);
          
          // Update status to APPROVED or BOOKED once at least one confirmed booking exists
          this.tourService.updatePlanStatus(this.selectedPlan!.id, 'APPROVED').subscribe(pRes => {
            if (pRes && pRes.success) this.selectedPlan = pRes.data;
          });

          // Send confirmation alert
          const messageText = `Payment of \$${res.data.invoice.totalAmount} processed. Invoice ${res.data.invoice.invoiceNumber} has been issued.`;
          this.notificationService.sendNotification(user.id, 'Booking Confirmation & Invoice', messageText, 'EMAIL').subscribe();

          this.checkoutBooking = null;
        }
        this.paying = false;
      },
      error: () => this.paying = false
    });
  }
}
