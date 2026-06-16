import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile, Passenger } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="app-container animate-fade-in">
      <div class="grid-cols-12 profile-grid">
        <!-- Left 6 Columns: Profile Preferences -->
        <div class="col-6 profile-section">
          <div class="glass-panel card-section">
            <h2>Traveler Profile & Preferences</h2>
            <div class="alert alert-success" *ngIf="profileSuccessMessage">
              {{ profileSuccessMessage }}
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="profile-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" formControlName="fullName" class="form-control">
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="text" formControlName="phone" class="form-control">
              </div>

              <!-- Preferences Form Sub-group -->
              <div class="preferences-box glass-panel">
                <h3>Travel Preferences</h3>
                
                <div class="form-group">
                  <label class="form-label">Dietary Preference</label>
                  <select formControlName="prefDiet" class="form-control">
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian / Anything</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Budget Tier</label>
                  <select formControlName="prefBudget" class="form-control">
                    <option value="Economy">Economy / Budget</option>
                    <option value="Mid-Range">Mid-Range / Comfort</option>
                    <option value="Luxury">Luxury / Executive</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Preferred Transport</label>
                  <select formControlName="prefTransport" class="form-control">
                    <option value="Flight">Aviation / Flights</option>
                    <option value="Train">Railway / Trains</option>
                    <option value="Taxi">Private Taxis</option>
                  </select>
                </div>
              </div>

              <button type="submit" [disabled]="profileForm.invalid || savingProfile" class="btn btn-primary block-btn">
                <span class="spinner" *ngIf="savingProfile"></span>
                <span *ngIf="!savingProfile">Save Preferences</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Right 6 Columns: Co-Passengers List & Forms -->
        <div class="col-6 passengers-section">
          <!-- Passengers List -->
          <div class="glass-panel card-section">
            <h2>Saved Passengers</h2>
            <p class="section-desc">Manage family and friends details to quickly add them to your flight or train bookings.</p>
            
            <div class="passenger-list">
              <div class="passenger-item" *ngFor="let p of passengers">
                <div class="pass-info">
                  <div class="pass-name">{{ p.fullName }}</div>
                  <div class="pass-sub">Age: {{ p.age }} | Gender: {{ p.gender }} | Passport: {{ p.passportNumber || 'N/A' }}</div>
                </div>
                <button (click)="onDeletePassenger(p.id!)" class="btn-delete">&times;</button>
              </div>
              <div class="empty-list" *ngIf="passengers.length === 0">
                No saved passengers. Use the form below to add.
              </div>
            </div>
          </div>

          <!-- Add Passenger Form -->
          <div class="glass-panel card-section add-passenger-card">
            <h2>Add Co-Passenger</h2>
            <form [formGroup]="passengerForm" (ngSubmit)="onAddPassenger()" class="passenger-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" formControlName="fullName" class="form-control" placeholder="Passenger full name">
                <div class="error-msg" *ngIf="pf['fullName'].touched && pf['fullName'].invalid">
                  Name is required.
                </div>
              </div>

              <div class="date-row">
                <div class="form-group col-6">
                  <label class="form-label">Age</label>
                  <input type="number" formControlName="age" class="form-control" placeholder="Age">
                  <div class="error-msg" *ngIf="pf['age'].touched && pf['age'].invalid">
                    Valid age is required.
                  </div>
                </div>
                <div class="form-group col-6">
                  <label class="form-label">Gender</label>
                  <select formControlName="gender" class="form-control">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Passport Number (Optional)</label>
                <input type="text" formControlName="passportNumber" class="form-control" placeholder="e.g. A12345678">
              </div>

              <button type="submit" [disabled]="passengerForm.invalid || savingPassenger" class="btn btn-secondary block-btn">
                <span class="spinner" *ngIf="savingPassenger"></span>
                <span *ngIf="!savingPassenger">+ Add Passenger</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 24px;
      margin-top: 20px;
    }
    .col-6 {
      grid-column: span 6;
    }
    .card-section {
      padding: 30px;
      border-radius: var(--border-radius-md);
      margin-bottom: 24px;
    }
    .card-section h2 {
      font-size: 1.35rem;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 10px;
    }
    .alert {
      padding: 12px 16px;
      border-radius: var(--border-radius-sm);
      font-size: 0.875rem;
      margin-bottom: 16px;
    }
    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #a7f3d0;
    }
    .profile-form, .passenger-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .preferences-box {
      padding: 20px;
      border-radius: var(--border-radius-sm);
      background: rgba(255, 255, 255, 0.02);
      margin-bottom: 10px;
    }
    .preferences-box h3 {
      font-size: 1rem;
      margin-bottom: 16px;
    }
    .block-btn {
      width: 100%;
    }
    
    .section-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 20px;
    }
    .passenger-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 250px;
      overflow-y: auto;
    }
    .passenger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--glass-border);
      padding: 12px 16px;
      border-radius: var(--border-radius-sm);
    }
    .pass-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    .pass-sub {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .btn-delete {
      background: none;
      border: none;
      color: var(--color-danger);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }
    .empty-list {
      font-size: 0.85rem;
      color: var(--text-muted);
      text-align: center;
      padding: 20px 0;
    }
    
    .date-row {
      display: flex;
      gap: 12px;
    }
    .error-msg {
      color: var(--color-danger);
      font-size: 0.75rem;
      margin-top: 6px;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passengerForm!: FormGroup;

  savingProfile = false;
  savingPassenger = false;
  profileSuccessMessage = '';

  passengers: Passenger[] = [];
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private profileService: UserProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initForms();
    
    const user = this.authService.currentUserValue;
    if (user) {
      this.userId = user.id;
      this.loadProfile();
      this.loadPassengers();
    }
  }

  initForms() {
    this.profileForm = this.fb.group({
      fullName: [''],
      phone: [''],
      prefDiet: ['Non-Veg'],
      prefBudget: ['Mid-Range'],
      prefTransport: ['Flight']
    });

    this.passengerForm = this.fb.group({
      fullName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['Male', Validators.required],
      passportNumber: ['']
    });
  }

  get pf() { return this.passengerForm.controls; }

  loadProfile() {
    this.profileService.getProfile(this.userId).subscribe(res => {
      if (res && res.success && res.data) {
        const profile: UserProfile = res.data;
        let diet = 'Non-Veg';
        let budget = 'Mid-Range';
        let transport = 'Flight';

        if (profile.preferences) {
          try {
            const prefs = JSON.parse(profile.preferences);
            diet = prefs.dietary || diet;
            budget = prefs.budget || budget;
            transport = prefs.transport || transport;
          } catch (e) {}
        }

        this.profileForm.patchValue({
          fullName: profile.fullName,
          phone: profile.phone,
          prefDiet: diet,
          prefBudget: budget,
          prefTransport: transport
        });
      }
    });
  }

  loadPassengers() {
    this.profileService.getPassengers(this.userId).subscribe(res => {
      if (res && res.success) {
        this.passengers = res.data;
      }
    });
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;
    this.savingProfile = true;
    this.profileSuccessMessage = '';

    const { fullName, phone, prefDiet, prefBudget, prefTransport } = this.profileForm.value;
    const preferencesJson = JSON.stringify({
      dietary: prefDiet,
      budget: prefBudget,
      transport: prefTransport
    });

    const updateRequest: UserProfile = {
      userId: this.userId,
      fullName,
      phone,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
      preferences: preferencesJson
    };

    this.profileService.updateProfile(this.userId, updateRequest).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.profileSuccessMessage = 'Preferences saved successfully!';
          setTimeout(() => this.profileSuccessMessage = '', 3000);
        }
        this.savingProfile = false;
      },
      error: () => this.savingProfile = false
    });
  }

  onAddPassenger() {
    if (this.passengerForm.invalid) return;
    this.savingPassenger = true;

    const passengerRequest: Passenger = {
      userId: this.userId,
      ...this.passengerForm.value
    };

    this.profileService.addPassenger(this.userId, passengerRequest).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.loadPassengers();
          this.passengerForm.reset({
            gender: 'Male'
          });
        }
        this.savingPassenger = false;
      },
      error: () => this.savingPassenger = false
    });
  }

  onDeletePassenger(passengerId: number) {
    this.profileService.deletePassenger(this.userId, passengerId).subscribe(res => {
      if (res && res.success) {
        this.loadPassengers();
      }
    });
  }
}
