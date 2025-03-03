import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    // Check for form validity first
    if (this.email.trim() === '' || this.password.trim() === '') {
      return; // Let form validation handle this
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.showPopup = false;

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.log('Login error:', error); // Debug logging

        // Handle various error response formats
        if (error.error) {
          this.errorMessage = error.error.message ||
            (typeof error.error === 'string' ? error.error : 'Login failed');

          // Check for error type in different possible locations
          const errorType = error.error.errorType ||
            error.error.error ||
            (error.status === 401 ? 'INVALID_CREDENTIALS' : '');

          // Show popup for credential errors
          if (errorType === 'USER_NOT_FOUND' ||
            errorType === 'INVALID_CREDENTIALS' ||
            error.status === 401) {
            this.showPopup = true;
          }
        } else {
          // Generic error handling
          this.errorMessage = 'Login failed. Please try again later.';
        }

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  dismissError() {
    this.errorMessage = '';
    this.showPopup = false;
  }
}
