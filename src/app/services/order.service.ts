import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderCreateDto, OrderStatusUpdateDto } from '../models/order.model';
import { AuthService } from './auth.service';

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
}