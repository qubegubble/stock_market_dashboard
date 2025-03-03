import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService, RegisterPayload } from '../auth.service';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink
  ],
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  errorMessage: string = '';
  registrationSuccess: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.errorMessage = '';
    this.registrationSuccess = false;

    const payload: RegisterPayload = {
      name: form.value.name,
      firstName: form.value.firstName,
      email: form.value.email,
      password: form.value.password
    };

    this.authService.registerUser(payload).subscribe({
      next: (response) => {
        console.log('User registered successfully!', response);
        this.registrationSuccess = true;
        if(this.registrationSuccess){
          this.router.navigate(['/dashboard']).then(r => console.log('Navigated to login component'));
        }
        form.reset();
      },
      error: (error) => {
        console.error('Error registering user', error);
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'An unknown error occurred';
        }
      }
    });
  }
  dismissError() {
    this.errorMessage = '';
  }
}
