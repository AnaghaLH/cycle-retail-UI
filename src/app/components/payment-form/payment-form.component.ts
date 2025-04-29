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

  // onSubmit(): void {
  //   if (this.paymentForm.valid) {
  //     this.isLoading = true;
      
  //     const paymentData = {
  //       orderId: this.paymentForm.value.orderId,
  //       amount: this.totalAmount,
  //       paymentMethod: this.paymentForm.value.paymentMethod,
  //       transactionId: this.paymentForm.value.transactionId || '',
  //       status: this.paymentForm.value.status,
  //       customerName: this.paymentForm.value.customerName,
  //       customerEmail: this.paymentForm.value.customerEmail,
  //       customerPhone: this.paymentForm.value.customerPhone,
  //       shippingAddress: this.paymentForm.value.shippingAddress,
  //       paymentDate: new Date().toISOString()
  //     };

  //     this.paymentService.createPayment(paymentData).subscribe({
  //       next: (response) => {
  //         this.isLoading = false;
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'Payment Successful!',
  //           text: 'Your order has been placed successfully.',
  //           confirmButtonColor: '#3085d6'
  //         }).then(() => {
  //           // Clear cart and redirect to order confirmation
  //           this.cartService.clearCart();
  //           this.router.navigate(['/orders', this.paymentForm.value.orderId]);
  //         });
  //       },
  //       error: (error) => {
  //         this.isLoading = false;
  //         const errorMessage =
  //           error?.error?.message ||
  //           error?.message ||
  //           'Payment failed. Please try again later.';
  //         console.error('Payment error:', error);
  //         this.toastr.error(errorMessage);
  //       }
  //     });
  //   } else {
  //     this.markFormGroupTouched(this.paymentForm);
  //   }
  // }
  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      return;
    }
  
    const paymentMethod = this.paymentForm.value.paymentMethod;
  
    if (paymentMethod === 'Card') {
      this.simulateCardPayment();
    } else if (paymentMethod === 'UPI') {
      this.showUpiQrAndSimulate();
    } else if (paymentMethod === 'Cash') {
      this.simulateCashPayment();
    }
  }
  
  // --- Helper methods ---
  
  private simulateCardPayment(): void {
    this.isLoading = true;
  
    setTimeout(() => {
      this.isLoading = false;
      const isSuccess = Math.random() > 0.3; // 70% success
  
      if (isSuccess) {
        this.showPaymentSuccessAndSave();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed!',
          text: 'Something went wrong during card payment. Please try again.',
          confirmButtonColor: '#d33'
        });
      }
    }, 2000); // 2 seconds fake delay
  }
  
  private showUpiQrAndSimulate(): void {
    Swal.fire({
      title: 'Scan QR to Pay',
      text: 'Use any UPI app to complete the payment',
      imageUrl: 'assets/qr.png', // Replace with your own QR later
      imageWidth: 250,
      imageHeight: 250,
      showCancelButton: true,
      confirmButtonText: 'Payment Done',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showPaymentSuccessAndSave();
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Payment Cancelled',
          text: 'UPI Payment was not completed.',
          confirmButtonColor: '#3085d6'
        });
      }
    });
  }
  
  private simulateCashPayment(): void {
    Swal.fire({
      icon: 'success',
      title: 'Order Placed!',
      text: 'Cash on Delivery selected. Please pay on delivery.',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      this.savePayment('Success');
    });
  }
  
  private showPaymentSuccessAndSave(): void {
    Swal.fire({
      icon: 'success',
      title: 'Payment Successful!',
      text: 'Your payment has been processed successfully.',
      confirmButtonColor: '#3085d6'
    }).then(() => {
      this.savePayment('Success');
    });
  }
  
  private savePayment(status: string): void {
    const paymentData = {
      orderId: this.paymentForm.value.orderId,
      amount: this.totalAmount,
      paymentMethod: this.paymentForm.value.paymentMethod,
      transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
      status: status,
      customerName: this.paymentForm.value.customerName,
      customerEmail: this.paymentForm.value.customerEmail,
      customerPhone: this.paymentForm.value.customerPhone,
      shippingAddress: this.paymentForm.value.shippingAddress,
      paymentDate: new Date().toISOString()
    };
  
    this.isLoading = true;
    this.paymentService.createPayment(paymentData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('Payment recorded successfully');
        this.cartService.clearCart();
        this.router.navigate(['/orders', this.paymentForm.value.orderId]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error saving payment:', error);
        this.toastr.error('Failed to record payment.');
      }
    });
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
