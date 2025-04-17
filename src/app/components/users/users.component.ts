import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  editingUserId: number | null = null;
  editedUser: any = {};
  searchTerm = '';
  searchSubject = new Subject<string>();
  filteredUsers: User[] = [];

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.applySearchFilter(searchTerm);
    });
  }
  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers('').subscribe({ // default searchTerm as empty
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load users');
        this.isLoading = false;
      }
    });
  }
  
  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.searchSubject.next(inputElement.value);
    }
  }

  applySearchFilter(searchTerm: string): void {
  const term = searchTerm.toLowerCase();
  this.filteredUsers = this.users.filter(user => 
    user.username?.toLowerCase().includes(term) ||
    user.email?.toLowerCase().includes(term) ||
    user.role?.toLowerCase().includes(term)
  );
}

  startEdit(user: any): void {
    this.editingUserId = user.userId;
    this.editedUser = { ...user };
  }

  cancelEdit(): void {
    this.editingUserId = null;
  }

  saveEdit(): void {
    if (!this.editingUserId) return;

    this.userService.updateUser(this.editingUserId, this.editedUser).subscribe({
      next: () => {
        this.toastr.success('User updated successfully');
        this.loadUsers();
        this.editingUserId = null;
      },
      error: (err) => {
        this.toastr.error('Failed to update user');
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.toastr.success('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => {
          this.toastr.error('Failed to delete user');
        }
      });
    }
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.applySearchFilter('');
  }
  
}
