// reports.component.ts
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CycleService } from '../../services/cycle.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  isLoading = false;
  dateRange: Date[] = [
    moment().subtract(7, 'days').toDate(),
    moment().toDate()
  ];
  reportData: any = {};
  chartOptions: any = {};
  salesData: any[] = [];
  inventoryStatus: any = {};
  popularCycles: any[] = [];

  constructor(
    private orderService: OrderService,
    private cycleService: CycleService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    const startDate = moment(this.dateRange[0]).format('YYYY-MM-DD');
    const endDate = moment(this.dateRange[1]).format('YYYY-MM-DD');


    Promise.all([
      this.fetchSalesReport(startDate, endDate),
      this.fetchInventoryReport(),
      this.fetchPopularCycles(startDate, endDate)
    ]).finally(() => {
      this.isLoading = false;
      this.prepareCharts();
    });
  }

  fetchSalesReport(startDate: string, endDate: string): Promise<void> {
    return new Promise((resolve) => {
      this.orderService.getSalesReport(startDate, endDate).subscribe({
        next: (data) => {
          this.reportData.sales = data;
          this.salesData = this.transformSalesData(data);
          resolve();
        },
        error: (err) => {
          this.toastr.error('Failed to load sales report');
          resolve();
        }
      });
    });
  }

  fetchInventoryReport(): Promise<void> {
    return new Promise((resolve) => {
      this.cycleService.getInventoryReport().subscribe({
        next: (data) => {
          this.inventoryStatus = data;
          resolve();
        },
        error: (err) => {
          this.toastr.error('Failed to load inventory report');
          resolve();
        }
      });
    });
  }

  fetchPopularCycles(startDate: string, endDate: string): Promise<void> {
    return new Promise((resolve) => {
      this.cycleService.getPopularCycles(startDate, endDate).subscribe({
        next: (data) => {
          this.popularCycles = data.slice(0, 5);
          resolve();
        },
        error: (err) => {
          this.toastr.error('Failed to load popular cycles');
          resolve();
        }
      });
    });
  }

  transformSalesData(data: any): any[] {
 
    return data.dailySales.map((day: any) => ({
      name: moment(day.date).format('MMM D'),
      value: day.totalSales
    }));
  }

  prepareCharts(): void {
    this.chartOptions = {
      salesChart: {
        title: {
          text: 'Sales Performance'
        },
        tooltip: {},
        xAxis: {
          data: this.salesData.map(item => item.name)
        },
        yAxis: {},
        series: [{
          name: 'Sales',
          type: 'bar',
          data: this.salesData.map(item => item.value)
        }]
      }
    };
  }

  onDateRangeChange(): void {
    this.loadReports();
  }

  exportReport(type: string): void {
    // Implement export functionality
    this.toastr.success(`Report exported as ${type}`);
  }
}