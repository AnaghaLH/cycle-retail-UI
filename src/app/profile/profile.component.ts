import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: any;
  orders: any[] = [];

  constructor(private authService: AuthService, private orderService: OrderService) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;

    this.orderService.getOrder(this.user?.id).subscribe(data => {

    });
  }

  editProfile() {
    // Navigate to edit form or open modal
  }

  changePassword() {
    // Navigate or open modal
  }
}
