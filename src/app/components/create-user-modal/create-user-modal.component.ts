import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { EmailService } from 'src/app/services/email.service';
import * as emailjs from 'emailjs-com';

@Component({
  selector: 'app-create-user-modal',
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.scss']
})
export class CreateUserModalComponent implements OnInit {
  @Output() userCreated = new EventEmitter<any>();
  isVisible = true; // Set to true by default since we're using it as a route
  roles = ['Admin', 'Employee', 'Customer'];
  isLoading = false;
  isSubmitting: boolean = false;


  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Employee', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private toastr: ToastrService,
    private emailService: EmailService
  ) {}

  ngOnInit(): void {
    // Component is always visible when used as a route
    this.isVisible = true;
  }

  handleCancel(): void {
    this.location.back(); // Use location.back() to return to previous page
    this.userForm.reset();
  }

  submitForm(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const userData = this.userForm.value;
      console.log('User email:', userData.email);
  
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          // Show success popup
          Swal.fire({
            icon: 'success',
            title: 'User Created',
            text: 'A verification email has been sent to the user.',
            confirmButtonColor: '#3085d6'
          });
  
          // Send email using EmailJS
          const emailParams = {
            email: userData.email ?? '',
            name: userData.username ?? 'User',
            message: 'Your account has been created successfully.',
            verify_link: `http://localhost:5081/api/verify?email=${encodeURIComponent(userData.email ?? '')}`,
          };
          
        console.log('Email parameters:', emailParams);
  
          emailjs.send('service_rncpdq4', 'template_02eovvk', emailParams, '1hwfDCPPuy5q9VyQa')
            .then(() => {
              console.log('Email sent successfully');
            })
            .catch((error) => {
              console.error('Email sending failed', error);
            });
  
          this.router.navigate(['/users'], { queryParams: { userCreated: 'true' } });
          this.userForm.reset();
        },
        error: (err) => {
          this.toastr.error(err.error.message || 'Failed to create user');
          this.isLoading = false;
        }
      });
    }
  }
}  
