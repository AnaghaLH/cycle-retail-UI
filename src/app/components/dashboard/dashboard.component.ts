import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order.model';
import { CycleService } from 'src/app/services/cycle.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  recentOrders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  totalCycles: number = 0;
  todaysOrders: number = 0;
  pendingOrders: number = 0;
  lowStock: number = 0;
  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private cycleService: CycleService
  ) {}

  ngOnInit(): void {
    this.fetchRecentOrders();
    this.fetchTotalCycles();
    this.fetchTodaysOrders();
    this.fetchPendingOrders();
    this.fetchLowStockCycles();
  }

  fetchRecentOrders(): void {
    this.isLoading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // Sort by date descending and pick top 5 recent orders
        this.recentOrders = orders
          .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
          .slice(0, 8);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders', error);
        this.errorMessage = 'Failed to load recent orders.';
        this.isLoading = false;
      }
    });
  }
  fetchTotalCycles(): void {
    this.cycleService.getCycles().subscribe({
      next: (response) => {
        // Handle both direct array and {$values} response formats
        const cyclesArray = response.$values || response;
        this.totalCycles = Array.isArray(cyclesArray) ? cyclesArray.length : 0;
      },
      error: (err) => {
        console.error('Error fetching cycles', err);
        this.totalCycles = 0;
      }
    });
  }

  fetchTodaysOrders(): void {
    this.orderService.getTodaysOrders().subscribe({
      next: (count) => {
        this.todaysOrders = count;
      },
      error: (err) => {
        console.error('Error fetching today\'s orders', err);
        this.todaysOrders = 0;
      }
    });
  }
  
  fetchPendingOrders(): void {
    this.orderService.getPendingOrders().subscribe({
      next: (count) => {
        this.pendingOrders = count;
      },
      error: (err) => {
        console.error('Error fetching pending orders', err);
        this.pendingOrders = 0;
      }
    });
  }

  fetchLowStockCycles(): void {
    this.cycleService.getLowStockCycles().subscribe({
      next: (cycles) => {
        this.lowStock = cycles.length;
      },
      error: (err) => {
        console.error('Error fetching low stock cycles', err);
        this.lowStock = 0;
      }
    });
  }
}