import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from 'src/app/services/order.service';
import { Order } from 'src/app/models/order.model';
import { CycleService } from 'src/app/services/cycle.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';

// Register all Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart', { static: true }) salesChartRef!: ElementRef;
  recentOrders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  totalCycles: number = 0;
  todaysOrders: number = 0;
  pendingOrders: number = 0;
  lowStock: number = 0;
  private chart: Chart | null = null;
  currentUser$: Observable<User | null>;
  

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private cycleService: CycleService
  ) {
    this.currentUser$ = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.fetchRecentOrders();
    this.fetchTotalCycles();
    this.fetchTodaysOrders();
    this.fetchPendingOrders();
    this.fetchLowStockCycles();
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  private initChart(): void {
    if (!this.salesChartRef) {
      console.error('Chart canvas not found');
      return;
    }

    const ctx = this.salesChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales',
          data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 35000, 32000, 40000, 38000, 45000],
          fill: true,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#667eea',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `$${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
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