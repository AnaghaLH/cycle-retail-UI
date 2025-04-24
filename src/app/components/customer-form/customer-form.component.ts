import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      address: ['']
    });
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
    if (this.customerForm.invalid) return;

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
}