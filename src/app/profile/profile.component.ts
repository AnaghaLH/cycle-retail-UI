import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  orders: Order[] = [];
  isAdmin: boolean = false;
  isEmployee: boolean = false;
  editForm: FormGroup;
  passwordForm: FormGroup;
  isEditing: boolean = false;
  isChangingPassword: boolean = false;

  constructor(
    private authService: AuthService, 
    private orderService: OrderService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  getOrderColumns(): Order[][] {
    if (this.orders.length <= 5) {
      return [this.orders];
    }

    const columns: Order[][] = [];
    const itemsPerColumn = 7;
    const totalColumns = Math.ceil(this.orders.length / itemsPerColumn);

    for (let i = 0; i < totalColumns; i++) {
      const start = i * itemsPerColumn;
      const end = start + itemsPerColumn;
      columns.push(this.orders.slice(start, end));
    }

    return columns;
  }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    console.log('Profile Component - User Object:', this.user);
    this.isAdmin = this.authService.isAdmin();
    this.isEmployee = this.authService.isEmployee();

    this.editForm.patchValue({
      username: this.user?.username,
      email: this.user?.email,
      role: this.user?.role
    });

    // Fetch orders based on user role
    if (this.user) {
      if (this.isEmployee) {
        console.log('Fetching orders for employee:', this.user.userId);
        this.orderService.getEmployeeOrders(this.user.userId).subscribe({
          next: (data: Order[]) => {
            console.log('Employee orders received:', data);
            this.orders = data;
          },
          error: (error) => {
            console.error('Error fetching employee orders:', error);
            if (error.status === 404) {
              this.toastr.warning('Order history feature is not available yet');
            } else {
              this.toastr.error('Failed to load order history');
            }
            this.orders = []; // Clear orders array on error
          }
        });
      } else if (this.isAdmin) {
        this.orderService.getOrders().subscribe({
          next: (data: Order[]) => {
            this.orders = data;
          },
          error: (error) => {
            console.error('Error fetching all orders:', error);
            this.toastr.error('Failed to load order history');
            this.orders = []; // Clear orders array on error
          }
        });
      }
    }
  }

  editProfile() {
    this.isEditing = true;
  }

  saveProfile() {
    if (this.editForm.valid) {
      this.toastr.success('Profile updated successfully');
      this.isEditing = false;

      this.user = { ...this.user, ...this.editForm.value };
    } else {
      this.toastr.error('Please fill all required fields correctly');
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm.patchValue({
      username: this.user?.username,
      email: this.user?.email
    });
  }

  changePassword() {
    this.isChangingPassword = true;
  }

  savePassword() {
    if (this.passwordForm.invalid) {
      this.toastr.error('Please fill all required fields correctly');
      return;
    }
  
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    console.log('Password Change Request:', {
      username: this.user?.username,
      currentPassword: currentPassword, 
      newPassword: newPassword, 
      confirmPassword: confirmPassword
    });

    if (newPassword !== confirmPassword) {
      this.toastr.error('New passwords do not match');
      return;
    }
  
    this.authService.changePassword(currentPassword, newPassword, confirmPassword).subscribe({
      next: (response) => {
        console.log('Password change response:', response);
        if (response.success) {
          this.toastr.success(response.message || 'Password changed successfully');
          this.authService.logout();
          this.toastr.info('Please log in again with your new password');
          this.router.navigate(['/login']);
    
          this.isChangingPassword = false;
          this.passwordForm.reset();
        } else {
          this.toastr.error(response.message || 'Failed to change password');
        }
      },
      error: (err) => {
        console.error('Password change error details:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error,
          message: err.message
        });
        
        // The error is already handled in the AuthService
        this.isChangingPassword = false;
        this.passwordForm.reset();
      }
    });
  }
  

  cancelPasswordChange() {
    this.isChangingPassword = false;
    this.passwordForm.reset();
  }


  manageUsers() {
    this.router.navigate(['/users']);
  }

  viewReports() {
    this.router.navigate(['/reports']);
  }

  manageInventory() {
    this.router.navigate(['/cycles']);
  }
}
