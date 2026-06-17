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
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
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
