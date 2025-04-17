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
      const id = Number(params.get('id'));
      console.log('Route param ID:', id);
  
      if (!id || isNaN(id)) {
        this.toastr.error('Invalid customer ID');
        this.router.navigate(['/customers']);
        return;
      }
    
    this.loadCustomer(id);
    this.loadCustomerOrders(id);
  });
}

  loadCustomer(id: number): void {
    this.customerService.getCustomer(id).subscribe({
      next: (customer) => {
        console.log('Customer fetched from API:', customer); 
        this.customer = customer;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading customer:', err); 
        this.toastr.error('Failed to load customer details');
        this.router.navigate(['/customers']);
      }
    });
  }

  

  loadCustomerOrders(customerId: number): void {
    this.orderService.getCustomerOrders(customerId).subscribe(orders => {
      this.orders = orders;
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