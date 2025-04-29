import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Customer } from 'src/app/models/customer.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order!: Order;
  customer!: Customer;
  isLoading = true;
  statusHistory: any[] = [];
  currentUser:any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private toastr: ToastrService,
    public authService: AuthService
  ) { this.currentUser = this.authService.currentUserValue;

  }

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.orderService.getOrder(id).subscribe({
      next: (order) => {
        this.order = order;
        this.generateStatusHistory();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load order details');
        this.router.navigate(['/orders']);
      }
    });
  }

  generateStatusHistory(): void {
    // In a real app, this would come from the API
    this.statusHistory = [
      { status: 'Pending', date: this.order.orderDate },
      { status: this.order.status, date: new Date() }
    ];
  }

  canUpdateStatus(): boolean {
    return this.authService.isAdmin() || 
           (this.authService.isEmployee() && this.order.status !== 'Delivered' && this.order.status !== 'Cancelled');
  }

  updateStatus(): void {
    const nextStatus = this.getNextStatus();
    if (!nextStatus) return;

    this.orderService.updateOrderStatus(this.order.orderId, { status: nextStatus }).subscribe({
      next: () => {
        this.toastr.success('Order status updated');
        this.loadOrder(this.order.orderId);
      },
      error: () => {
        this.toastr.error('Failed to update order status');
      }
    });
  }

  getNextStatus(): 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | null {
    switch (this.order.status) {
      case 'Pending': return 'Processing';
      case 'Processing': return 'Shipped';
      case 'Shipped': return 'Delivered';
      default: return null;
    }
  }

  printOrder(): void {
    window.print();
  }
}