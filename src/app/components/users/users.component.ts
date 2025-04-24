import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

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
    public authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.applySearchFilter(searchTerm);
    });

    // Subscribe to route events to handle user creation
    this.route.queryParams.subscribe(params => {
      if (params['userCreated'] === 'true') {
        this.loadUsers(); // Reload users when a new user is created
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers('').subscribe({ 
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
    Swal.fire({
      title: 'Are you sure?',
      text: 'This user will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.toastr.success('User deleted successfully');
            this.loadUsers();
          },
          error: () => {
            this.toastr.error('Failed to delete user');
          }
        });
      }
    });
  }
  

  clearSearch(): void {
    this.searchTerm = '';
    this.applySearchFilter('');
  }

  onCreateUser(userData: any) {
    this.userService.createUser(userData).subscribe({
      next: (response) => {
        this.toastr.success(response.message);
        this.users = [...this.users, response.user];
      },
      error: (err) => {
        this.toastr.error(err.error.message || 'Failed to create user');
      }
    });
    console.log("ji");
  }
  
}
