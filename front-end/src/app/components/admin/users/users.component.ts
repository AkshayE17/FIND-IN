import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { IUser } from '../../../state/user/user.state';
import { AdminService } from '../../../services/adminService';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users$: Observable<IUser[]> = new Observable<IUser[]>();
  loading = false;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.users$ = this.adminService.getAllUsers();
    this.users$.subscribe({
      complete: () => this.loading = false
    });
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
  
  }

  viewUserDetails(user: IUser) {
    this.router.navigate(['/user/details', user.email]);
  }

  editUser(user: IUser) {
    // Navigate to user edit form
    this.router.navigate(['/user/edit', user.email]);
  }

  blockUser(user: IUser) {
    Swal.fire({
      title: 'Block User',
      text: `Are you sure you want to block ${user.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Block',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.blockUser(user.email).subscribe({
          next: () => {
            Swal.fire({
              title: 'Deleted!',
              text: 'User has been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadUsers();
          },  
          error: (error) => {
            Swal.fire('Error!', error.message, 'error');
          }
        });
      }
    });
  }
}  
