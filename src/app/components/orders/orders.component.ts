import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  statusFilter = '';
  searchQuery = '';
  orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load orders');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];
    
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.customer?.firstName.toLowerCase().includes(query) ||
        order.customer?.lastName.toLowerCase().includes(query) ||
        order.orderId.toString().includes(query)
      );
    }
    
    this.orders = filtered;
  }

  isStatusAvailable(currentStatus: string, targetStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'Pending': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered'],
      'Delivered': [],
      'Cancelled': []
    };
    return validTransitions[currentStatus].includes(targetStatus);
  }

  updateStatus(orderId: number, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, { status: newStatus as any }).subscribe({
      next: () => {
        this.toastr.success('Order status updated');
      },
      error: () => {
        this.toastr.error('Failed to update order status');
        this.loadOrders(); // Reload to reset status
      }
    });
  }

  deleteOrder(orderId: number): void {
    if (!confirm('Are you sure you want to delete this order?')) return;

    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.toastr.success('Order deleted successfully');
        this.loadOrders();
      },
      error: () => {
        this.toastr.error('Failed to delete order');
      }
    });
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      endPage = Math.min(totalPages, startPage + 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }
}