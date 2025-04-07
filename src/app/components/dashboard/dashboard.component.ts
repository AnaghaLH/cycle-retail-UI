import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  recentOrders = [
    { id: 1001, customer: 'John Doe', date: new Date(), amount: 599.99, status: 'Pending' },
    { id: 1002, customer: 'Jane Smith', date: new Date(), amount: 1299.99, status: 'Processing' },
    { id: 1003, customer: 'Robert Johnson', date: new Date(), amount: 799.99, status: 'Shipped' },
    { id: 1004, customer: 'Emily Davis', date: new Date(), amount: 499.99, status: 'Delivered' },
    { id: 1005, customer: 'Michael Wilson', date: new Date(), amount: 899.99, status: 'Pending' }
  ];

  constructor(public authService: AuthService) {}
}