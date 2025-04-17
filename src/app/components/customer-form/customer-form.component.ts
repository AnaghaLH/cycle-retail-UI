import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss']
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isSubmitting = false;
  customerId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.customerForm = this.fb.group({
      customerId:[null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email]],
      phone: [''],
      address: ['']
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.params['id'];
    if (this.customerId) {
      this.loadCustomer(this.customerId);
    }
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
      next: () => {
        this.toastr.success(`Customer ${this.customerId ? 'updated' : 'created'} successfully`);
        this.router.navigate(['/customers']);
      },
      
      error: () => {
        this.toastr.error(`Failed to ${this.customerId ? 'update' : 'create'} customer`);
        this.isSubmitting = false;
      }
    });
    console.log('Customer Payload:', this.customerForm.value);
  }
}