import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service.ts.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Payment } from 'src/app/models/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;
  cartItems: any[] = [];
  totalAmount: number = 0;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private orderService: OrderService,
    private customerService: CustomerService
  ) {
    // Initialize form with default values
    this.paymentForm = this.fb.group({
      orderId: [null],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['Card', Validators.required],
      transactionId: [''],
      status: ['Pending', Validators.required],
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      shippingAddress: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get cart items from service
    this.cartItems = this.cartService.getItems();
    this.totalAmount = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Get order ID from URL parameters
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (!orderId) {
        this.toastr.error('No order ID found. Please try again.');
        this.router.navigate(['/shop']);
        return;
      }

      // Update form with order ID and amount
      this.paymentForm.patchValue({
        orderId: orderId,
        amount: this.totalAmount
      });

      // Get order details to pre-fill customer information
      this.orderService.getOrder(Number(orderId)).subscribe({
        next: (order) => {
          // Get customer details
          this.customerService.getCustomer(order.customerId).subscribe({
            next: (customer) => {
              // Update form with customer details
              this.paymentForm.patchValue({
                customerName: `${customer.firstName} ${customer.lastName}`,
                customerEmail: customer.email,
                customerPhone: customer.phone,
                shippingAddress: customer.address
              });
            },
            error: (error) => {
              console.error('Error loading customer:', error);
              this.toastr.error('Failed to load customer details');
              this.router.navigate(['/shop']);
            }
          });
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.toastr.error('Failed to load order details');
          this.router.navigate(['/shop']);
        }
      });
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      
      const paymentData = {
        orderId: this.paymentForm.value.orderId,
        amount: this.totalAmount,
        paymentMethod: this.paymentForm.value.paymentMethod,
        transactionId: this.paymentForm.value.transactionId || '',
        status: this.paymentForm.value.status,
        customerName: this.paymentForm.value.customerName,
        customerEmail: this.paymentForm.value.customerEmail,
        customerPhone: this.paymentForm.value.customerPhone,
        shippingAddress: this.paymentForm.value.shippingAddress,
        paymentDate: new Date().toISOString()
      };

      this.paymentService.createPayment(paymentData).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your order has been placed successfully.',
            confirmButtonColor: '#3085d6'
          }).then(() => {
            // Clear cart and redirect to order confirmation
            this.cartService.clearCart();
            this.router.navigate(['/orders', this.paymentForm.value.orderId]);
          });
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage =
            error?.error?.message ||
            error?.message ||
            'Payment failed. Please try again later.';
          console.error('Payment error:', error);
          this.toastr.error(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched(this.paymentForm);
    }
  }
  
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.paymentForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    if (control?.hasError('min')) {
      return 'Amount must be greater than 0';
    }
    return '';
  }
}
