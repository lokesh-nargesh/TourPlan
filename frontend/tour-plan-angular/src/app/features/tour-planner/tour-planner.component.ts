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
  templateUrl: './tour-planner.component.html',
  styleUrl: './tour-planner.component.css'
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
