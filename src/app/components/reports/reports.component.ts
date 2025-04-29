// reports.component.ts
import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CycleService } from '../../services/cycle.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as echarts from 'echarts';

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
    // Sample data - replace with actual data from your backend
    const orderStatusData = [
      { value: 45, name: 'Completed' },
      { value: 30, name: 'Processing' },
      { value: 15, name: 'Pending' },
      { value: 10, name: 'Cancelled' }
    ];

    const categoryRevenueData = [
      { value: 12000, name: 'Mountain Cycle' },
      { value: 8000, name: 'Road Cycle' },
      { value: 6000, name: 'Hybrid Cycle' },
      { value: 4000, name: 'Electric Cycle' }
    ];

    this.chartOptions = {
      salesChart: {
        title: {
          text: 'Sales Performance',
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const data = params[0];
            return `${data.name}<br/>Sales: ${data.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.salesData.map(item => item.name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => {
              return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
            }
          }
        },
        series: [{
          name: 'Sales',
          type: 'bar',
          data: this.salesData.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      },
      orderStatusChart: {
        title: {
          
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: 'Order Status',
          type: 'pie',
          radius: '50%',
          data: orderStatusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      },
      categoryChart: {
        title: {
          
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [{
          name: 'Revenue',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: categoryRevenueData
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