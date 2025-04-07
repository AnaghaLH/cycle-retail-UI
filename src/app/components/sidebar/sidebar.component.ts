import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  collapsed = false;

  constructor(public authService: AuthService) {}

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }
}