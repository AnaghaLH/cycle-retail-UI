import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5081/api/User';

  constructor(private http: HttpClient, private authService: AuthService) { }
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token;
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllUsers(searchTerm: string): Observable<User[]> {
    const params = searchTerm ? { params: new HttpParams().set('search', searchTerm) } : {};
    return this.http.get<User[]>(`${this.apiUrl}/all-users`,{
      headers: this.getAuthHeaders()
    });
  }

  updateUser(userId: number, userData: any) {
    
    return this.http.put(`${this.apiUrl}/update/${userId}`, userData,{
      headers: this.getAuthHeaders()
    });
  }

  deleteUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/delete/${userId}`,{
      headers: this.getAuthHeaders()
    });
  }
}
