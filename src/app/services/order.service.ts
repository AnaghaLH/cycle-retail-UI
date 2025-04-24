import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderCreateDto, OrderStatusUpdateDto } from '../models/order.model';
import { AuthService } from './auth.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:5081/api/Orders';

  constructor(private http: HttpClient, private authService: AuthService) { }
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getEmployeeOrders(userId: number): Observable<Order[]> {
    console.log('OrderService - Fetching orders for employee:', userId);
    return this.http.get<Order[]>(`${this.apiUrl}/employee/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(orders => console.log('OrderService - Employee orders received:', orders)),
      catchError(error => {
        console.error('OrderService - Error fetching employee orders:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        throw error;
      })
    );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createOrder(order: OrderCreateDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order, {
      headers: this.getAuthHeaders()
    });
  }

  updateOrderStatus(id: number, statusUpdate: OrderStatusUpdateDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, statusUpdate, {
      headers: this.getAuthHeaders()
    });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomerOrders(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer/${customerId}`, {
      headers: this.getAuthHeaders()
    });
  }
  // order.service.ts
getTodaysOrders(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/today`, {
    headers: this.getAuthHeaders()
  });
}

getPendingOrders(): Observable<number> {
  return this.http.get<number>(`${this.apiUrl}/pending`, {
    headers: this.getAuthHeaders()
  });
}
// order.service.ts
getSalesReport(startDate: string, endDate: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/report/sales`, {
    params: { startDate, endDate},
    headers: this.getAuthHeaders()
  });
}

// cycle.service.ts

}