import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'http://localhost:5081/api/Customers';

  constructor(private http: HttpClient, private authService: AuthService) { }
    private getAuthHeaders(): HttpHeaders {
      const token = this.authService.currentUserValue?.token;
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
  

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer, {
      headers: this.getAuthHeaders()
    });
  }

  updateCustomer(id: number, customer: Customer): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, customer, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}