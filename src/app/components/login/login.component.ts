import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    // Check for saved credentials
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({
        username: savedUsername,
        rememberMe: true
      });
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, password, rememberMe } = this.loginForm.value;

    // Handle remember me functionality
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastr.success('Login successful');
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error('Invalid username or password');
      }
    });
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    // Implement forgot password logic here
    this.toastr.info('Please contact your administrator to reset your password');
  }
}