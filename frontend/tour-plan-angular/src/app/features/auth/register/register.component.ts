import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'Registration failed.';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to register. Username/email may exist.';
        this.loading = false;
      }
    });
  }
}
