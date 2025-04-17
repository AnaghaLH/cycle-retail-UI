import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Payment } from '../models/payment.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://localhost:5001/api/payments'; // adjust URL based on your backend

   constructor(private http: HttpClient, private authService: AuthService) { }
    private getAuthHeaders(): HttpHeaders {
      const token = this.authService.currentUserValue?.token;
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
  
  createPayment(payment: Payment): Observable<any> {
    return this.http.post(this.apiUrl, {
      headers: this.getAuthHeaders()
  });
  }
  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
  });
  }
}
