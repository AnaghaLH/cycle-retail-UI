import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isSubmitting = false;
  customerId: number | null = null;
  returnUrl: string | null = null;
  cartItems: any[] = [];
  existingCustomers: Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private orderService: OrderService
  ) {
    this.customerForm = this.fb.group({
      customerId: [0],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required]
    });

    // Load existing customers for validation
    this.loadExistingCustomers();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        // Store return URL and cart items for later use
        this.returnUrl = params['returnUrl'];
        this.cartItems = JSON.parse(params['cartItems'] || '[]');
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.customerId = Number(id);
        this.loadCustomer(this.customerId);
      }
    });

    // Add custom validators for email and phone
    this.setupCustomValidators();
  }

  private loadExistingCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers: Customer[]) => {
        this.existingCustomers = customers;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading customers:', error);
        this.toastr.error('Failed to load existing customers');
      }
    });
  }

  private setupCustomValidators(): void {
    // Email duplicate validator
    this.customerForm.get('email')?.setAsyncValidators([
      (control) => {
        return new Promise((resolve) => {
          const email = control.value;
          if (!email) {
            resolve(null);
            return;
          }

          const isDuplicate = this.existingCustomers.some(customer => 
            customer.email.toLowerCase() === email.toLowerCase() && 
            customer.customerId !== this.customerId
          );

          if (isDuplicate) {
            resolve({ emailDuplicate: true });
          } else {
            resolve(null);
          }
        });
      }
    ]);

    // Phone duplicate validator
    this.customerForm.get('phone')?.setAsyncValidators([
      (control) => {
        return new Promise((resolve) => {
          const phone = control.value;
          if (!phone) {
            resolve(null);
            return;
          }

          const isDuplicate = this.existingCustomers.some(customer => 
            customer.phone === phone && 
            customer.customerId !== this.customerId
          );

          if (isDuplicate) {
            resolve({ phoneDuplicate: true });
          } else {
            resolve(null);
          }
        });
      }
    ]);
  }

  loadCustomer(id: number): void {
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
      },
      error: () => {
        this.toastr.error('Failed to load customer');
        this.router.navigate(['/customers']);
      }
    });
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.validateAllFormFields();
      return;
    }

    this.isSubmitting = true;
    const customerData = this.customerForm.value;

    const operation = this.customerId
      ? this.customerService.updateCustomer(this.customerId, customerData)
      : this.customerService.createCustomer(customerData);

    operation.subscribe({
      next: (customer) => {
        this.toastr.success(`Customer ${this.customerId ? 'updated' : 'created'} successfully`);
        
        if (this.returnUrl) {
          // Create order with new customer
          const orderData = {
            customerId: customer.customerId,
            userId: this.authService.currentUserValue?.userId || 0,
            items: this.cartItems.map(item => ({
              cycleId: item.cycleId,
              quantity: item.quantity,
              unitPrice: item.price
            }))
          };

          this.orderService.createOrder(orderData).subscribe({
            next: (orderResponse) => {
              // Navigate to payment page with order ID
              this.router.navigate([this.returnUrl], { 
                queryParams: { orderId: orderResponse.orderId }
              });
            },
            error: (error) => {
              console.error('Order creation error:', error);
              this.toastr.error('Failed to create order. Please try again.');
              this.isSubmitting = false;
            }
          });
        } else {
          this.router.navigate(['/customers']);
        }
      },
      error: () => {
        this.toastr.error(`Failed to ${this.customerId ? 'update' : 'create'} customer`);
        this.isSubmitting = false;
      }
    });
    console.log('Customer Payload:', this.customerForm.value);
  }

  private validateAllFormFields(): void {
    Object.keys(this.customerForm.controls).forEach(field => {
      const control = this.customerForm.get(field);
      if (control) {
        control.markAsTouched({ onlySelf: true });
      }
    });
  }

  // Helper methods for template
  isFieldInvalid(field: string): boolean {
    const control = this.customerForm.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(field: string): string {
    const control = this.customerForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (control.errors['pattern']) {
      return 'Please enter a valid 10-digit phone number';
    }
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['emailDuplicate']) {
      return 'This email is already registered';
    }
    if (control.errors['phoneDuplicate']) {
      return 'This phone number is already registered';
    }
    return '';
  }
}