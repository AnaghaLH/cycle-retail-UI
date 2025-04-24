import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { Customer } from '../../models/customer.model';
import { Order } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})
export class CustomerDetailComponent implements OnInit {
  customer!: Customer;
  orders: Order[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private orderService: OrderService,
    private toastr: ToastrService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.router.navigate(['/customers']);
        return;
      }

      const customerId = Number(id);
      if (isNaN(customerId)) {
        this.router.navigate(['/customers']);
        return;
      }

      this.loadCustomer(customerId);
      this.loadCustomerOrders(customerId);
    });
  }

  loadCustomer(id: number): void {
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer = customer;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.router.navigate(['/customers']);
      }
    });
  }

  loadCustomerOrders(customerId: number): void {
    this.orderService.getCustomerOrders(customerId).subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (err) => {
        console.error('Error loading customer orders:', err);
        
      }
    });
  }

  deleteCustomer(): void {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    this.customerService.deleteCustomer(this.customer.customerId).subscribe({
      next: () => {
        this.toastr.success('Customer deleted successfully');
        this.router.navigate(['/customers']);
      },
      error: () => {
        this.toastr.error('Failed to delete customer');
      }
    });
  }
}