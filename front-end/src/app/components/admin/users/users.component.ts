import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { IUser } from '../../../state/user/user.state'; 
import { AdminService } from '../../../services/admin.service'; 
import { Observable, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  users$: Observable<IUser[]> = new Observable<IUser[]>();
  totalUsers: number = 0;
  pageSize: number = 5;
  currentPage: number = 1;
  loading = false;
  subscriptions: Subscription = new Subscription();

  searchSubject: Subject<string> = new Subject<string>();

  filters = {
    gender: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    isBlocked: null as boolean | null
  };

  genderOptions = [
    { value: '', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  blockStatusOptions = [
    { value: '', label: 'All Users' },
    { value: 'true', label: 'Blocked' },
    { value: 'false', label: 'Unblocked' }
  ];

  isFiltersVisible = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();

    // Set up debounce for search
    const searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // Adjust the debounce time as needed (in milliseconds)
        distinctUntilChanged()
      )
      .subscribe((searchTerm) => {
        this.filters.searchTerm = searchTerm;
        this.loadUsers(1); // Reload users on debounced search term change
      });

    this.subscriptions.add(searchSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadUsers(page: number = 1) {
    this.loading = true;
    const loadUserSubscription = this.adminService.getAllUsers(
      page,
      this.pageSize,
      this.filters.searchTerm,
      this.filters.gender,
      this.filters.startDate,
      this.filters.endDate,
      this.filters.isBlocked
    ).subscribe({
      next: (data) => {
        this.users$ = of(data.users);
        this.totalUsers = data.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error!', error.message, 'error');
      }
    });

    this.subscriptions.add(loadUserSubscription);
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm); 
  }

 

  onGenderChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.filters.gender = target.value;
      this.applyFilters();
    }
  }

  onBlockStatusChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const value = target.value;
      this.filters.isBlocked = value === '' ? null : value === 'true';
      console.log('Updated isBlocked:', this.filters.isBlocked); 
    }
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadUsers(1);
  }

  resetFilters() {
    this.filters = {
      gender: '',
      startDate: '',
      endDate: '',
      searchTerm: '',
      isBlocked: null
    };
    this.loadUsers(1);
  }



  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers(page);
    }
  }

  viewDetails(user: IUser) {
    const detailsHtml = `
      <strong>Name:</strong> ${user.name} <br>
      <strong>Email:</strong> ${user.email} <br>
      <strong>Gender:</strong> ${user.gender} <br>
      <strong>Mobile:</strong> ${user.mobile} <br>
      <strong>Status:</strong> ${user.isBlocked ? 'Blocked' : 'Unblocked'} <br>
      <strong>Verified:</strong> ${user.isVerified ? 'Yes' : 'No'} <br>
      <strong>Registration Date:</strong> ${new Date(user.createdAt).toLocaleDateString()} <br>
    `;

    Swal.fire({
      title: 'User Details',
      html: detailsHtml,
      imageUrl: user.imageUrl || 'assets/user.jpg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'User Image',
      confirmButtonText: 'Close'
    });
  }

  blockOrUnblockUser(user: IUser) {
    const action = user.isBlocked ? 'Unblock' : 'Block';
    const actionText = user.isBlocked ? 'unblocked' : 'blocked';

    Swal.fire({
      title: `${action} User`,
      text: `Are you sure you want to ${action.toLowerCase()} ${user.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action.toLowerCase()}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: user.isBlocked ? '#4caf50' : '#c62828',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        const blockSubscription = this.adminService.blockOrUnblockUser(user.email).subscribe({
          next: () => { 
            Swal.fire({
              title: `${action}ed!`,
              text: `User has been successfully ${actionText}.`,
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
        this.subscriptions.add(blockSubscription);
      }
    });
  }
}
