import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payment } from '../models/payment.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5081/api/Payment'; // adjust URL based on your backend

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
  createPayment(payment: Payment): Observable<any> {
    const headers = this.getAuthHeaders()
      .set('Content-Type', 'application/json');
    
    // Format the request to match PaymentRequestDto
    const requestBody = {
      orderId: payment.orderId ? Number(payment.orderId) : 0,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId || '',
      status: payment.status,
      paymentDate: payment.paymentDate || new Date().toISOString(),
      customerName: payment.customerName,
      customerEmail: payment.customerEmail,
      customerPhone: payment.customerPhone,
      shippingAddress: payment.shippingAddress
    };
      
    return this.http.post(this.apiUrl, requestBody, { headers });
  }

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // New method to fetch payment by ID
  getPaymentById(id: number): Observable<Payment> {
    const url = `${this.apiUrl}/${id}`; // Adjust URL to include ID
    return this.http.get<Payment>(url, {
      headers: this.getAuthHeaders()
    });
  }
}
