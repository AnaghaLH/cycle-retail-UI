import { Component, OnInit } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  returnUrl: string | null = null;
  cartItems: any[] = [];

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        // Store return URL and cart items for later use
        this.returnUrl = params['returnUrl'];
        this.cartItems = JSON.parse(params['cartItems'] || '[]');
      }
    });
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load customers');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.customers];
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(query) ||
        customer.lastName.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    }
    
    this.filteredCustomers = filtered;
    this.totalItems = this.filteredCustomers.length;
    this.currentPage = 1; // Reset to first page when filters change
  }

  deleteCustomer(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.customerService.deleteCustomer(id).subscribe({
          next: () => {
            this.toastr.success('Customer deleted successfully');
            this.loadCustomers();
          },
          error: () => {
            this.toastr.error('Failed to delete customer');
          }
        });
      }
    });
  }
  goToCustomerDetail(customerId: number): void {
    if (!this.returnUrl) {
      this.router.navigate(['/customers', customerId]);
    }
  }
  
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  calculateItemRange(): string {
    const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endItem = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${startItem} to ${endItem} of ${this.totalItems} customers`;
  }

  get pagedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCustomers.slice(start, start + this.itemsPerPage);
  }

  selectCustomer(customer: Customer): void {
    if (this.returnUrl) {
      // Create order with selected customer
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
        }
      });
    } else {
      // Normal customer selection
      this.router.navigate(['/customers', customer.customerId]);
    }
  }
}