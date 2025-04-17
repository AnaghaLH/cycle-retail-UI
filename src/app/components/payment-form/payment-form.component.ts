import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from 'src/app/services/payment.service.ts.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
})
export class PaymentFormComponent implements OnInit {
  paymentForm!: FormGroup;

  constructor(private fb: FormBuilder, private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      orderId: [null, Validators.required],
      amount: [null, Validators.required],
      paymentMethod: ['Cash', Validators.required],
      transactionId: [''],
      status: ['Completed', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.paymentService.createPayment(this.paymentForm.value).subscribe({
        next: () => alert('Payment submitted successfully'),
        error: (err) => console.error('Error:', err)
      });
    }
  }
}
