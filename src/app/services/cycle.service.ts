import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cycle } from '../models/cycle.model';
// import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CycleResponseDto } from '../models/cycle.dto';
@Injectable({
  providedIn: 'root'
})
export class CycleService {
  private apiUrl = 'http://localhost:5081/api/cycles';

  constructor(private http: HttpClient,
    private authService: AuthService
  ) { }
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.currentUserValue?.token || localStorage.getItem('access_token');  // Ensure the token is stored after login
    if (!token) {
      console.error('No token available');
      throw new Error('Authentication token missing');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  
  getCyclesPaginated(page: number, pageSize: number, filters: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    // Add filter params
    for (const key in filters) {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    }
  
    // ✅ Get token correctly from localStorage
    const token = localStorage.getItem('access_token');
  
    // ✅ Set Authorization header if token exists
    const headers = token 
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`) 
      : new HttpHeaders();
  
    // ✅ Make GET request with params and headers
    return this.http.get<any>(this.apiUrl, { params, headers });
  }
  
  getCycles(): Observable<{$id: string, $values: Cycle[] }> {
    return this.http.get<{ $id: string, $values: Cycle[] }>(this.apiUrl, {headers: this.getAuthHeaders()});
  }

  getCycle(id: number): Observable<Cycle> {
    return this.http.get<Cycle>(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()});
  }

  createCycle(cycle: CycleResponseDto): Observable<Cycle> {
    return this.http.post<Cycle>(this.apiUrl, cycle, {headers: this.getAuthHeaders()});
  }

  updateCycle(id: number, cycle: CycleResponseDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, cycle, {headers: this.getAuthHeaders()});
  }

  deleteCycle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {headers: this.getAuthHeaders()});
  }

  getLowStockCycles(threshold: number = 5): Observable<Cycle[]> {
    return this.http.get<Cycle[]>(`${this.apiUrl}/low-stock?threshold=${threshold}`, {
      headers: this.getAuthHeaders()
    });
  }
  uploadCycleImage(cycleId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${cycleId}/upload-image`, formData);
  }
  
}