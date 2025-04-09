import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser') as string || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>('http://localhost:5081/api/Auth/login', { username, password })
      .pipe(map(response => {
        localStorage.setItem('access_token', response.token);
        console.log("Login API Response:", response); // Debug API Response
        
        if (!response.token) {
          throw new Error('No token received from API');
        }
        const token = response.token;
        console.log("Decoded Token:", this.jwtHelper.decodeToken(token));
        const decodedToken = this.jwtHelper.decodeToken(token);
        
        const user = {
          userId:decodedToken.nameid,
          username: decodedToken.unique_name,
          role: decodedToken.role,
          token: token
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        //localStorage.setItem('access_token', response.token);
        this.currentUserSubject.next(user);
        
        return user;
      }));
  }
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    this.toastr.info('You have been logged out');
  }

  isLoggedIn() {
    const user = this.currentUserValue;
    const token = localStorage.getItem('access_token');
    return user && token && !this.jwtHelper.isTokenExpired(token);
  }

  isAdmin() {
    const user = this.currentUserValue;
    return user && user.role === 'Admin';
  }

  isEmployee() {
    const user = this.currentUserValue;
    return user && user.role === 'Employee';
  }
}