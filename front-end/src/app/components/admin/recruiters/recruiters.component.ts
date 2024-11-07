import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { AdminService } from '../../../services/adminService';
import { Observable, of, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recruiters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recruiters.component.html',
  styleUrls: ['./recruiters.component.scss']
})
export class RecruitersComponent implements OnInit, OnDestroy {
  recruiters$: Observable<IRecruiter[]> = new Observable<IRecruiter[]>();
  totalRecruiters: number = 0;
  pageSize: number = 1;
  currentPage: number = 1;
  loading = false;
  private subscriptions: Subscription[] = []; // Array to store subscriptions

  filters = {
    company: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
    isBlocked: null as boolean | null
  };
  blockStatusOptions = [
    { value: '', label: 'All Recruiters' },
    { value: 'true', label: 'Blocked' },
    { value: 'false', label: 'Unblocked' }
  ];
  isFiltersVisible = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRecruiters();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadRecruiters(page: number = 1) {
    this.loading = true;
    const sub = this.adminService.getAllRecruiters(
      page,
      this.pageSize,
      this.filters.searchTerm,
      this.filters.company,
      this.filters.startDate,
      this.filters.endDate,
      this.filters.isBlocked
    ).subscribe({
      next: (data) => {
        this.recruiters$ = of(data.recruiters);
        this.totalRecruiters = data.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error!', error.message, 'error');
      }
    });
    this.subscriptions.push(sub); // Add subscription to array
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
    this.loadRecruiters(1);
  }

  resetFilters() {
    this.filters = {
      company: '',
      startDate: '',
      endDate: '',
      searchTerm: '',
      isBlocked: null
    };
    this.loadRecruiters(1);
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.filters.searchTerm = searchTerm;
    this.loadRecruiters(1);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRecruiters / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRecruiters(page);
    }
  }

  viewDetails(recruiter: IRecruiter) {
    const detailsHtml = `
      <strong>Name:</strong> ${recruiter.name} <br>
      <strong>Email:</strong> ${recruiter.email} <br>
      <strong>Company:</strong> ${recruiter.companyName || 'N/A'} <br>
      <strong>Job Title:</strong> ${recruiter.jobTitle || 'N/A'} <br>
      <strong>Company Website:</strong> <a href="${recruiter.companyWebsite}" target="_blank">${recruiter.companyWebsite}</a> <br>
      <strong>EIN Number:</strong> ${recruiter.einNumber || 'N/A'} <br>
      <strong>Gender:</strong> ${recruiter.gender} <br>
      <strong>Mobile:</strong> ${recruiter.mobile} <br>
      <strong>Verified:</strong> ${recruiter.isVerified ? 'Yes' : 'No'} <br>
      <strong>Status:</strong> ${recruiter.isBlocked ? 'Blocked' : 'Unblocked'} <br>
      <strong>Approved:</strong> ${recruiter.isApproved} <br>
      <strong>Registration Date:</strong> ${recruiter.createdAt} <br>
    `;
  
    Swal.fire({
      title: 'Recruiter Details',
      html: detailsHtml,
      imageUrl: recruiter.imageUrl || 'assets/Recruiter.jpg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Recruiter Image',
      confirmButtonText: 'Close'
    });
  }

  blockOrUnblockRecruiter(recruiter: IRecruiter) {
    const action = recruiter.isBlocked ? 'Unblock' : 'Block';
    const actionText = recruiter.isBlocked ? 'unblocked' : 'blocked';
  
    Swal.fire({
      title: `${action} Recruiter`,
      text: `Are you sure you want to ${action.toLowerCase()} ${recruiter.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action.toLowerCase()}`,
      cancelButtonText: 'Cancel',
      confirmButtonColor: recruiter.isBlocked ? '#4caf50' : '#c62828', 
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.adminService.blockOrUnblockRecruiter(recruiter.email).subscribe({
          next: () => {
            Swal.fire({
              title: `${action}ed!`,
              text: `Recruiter has been successfully ${actionText}.`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadRecruiters();
          },
          error: (error) => {
            Swal.fire('Error!', error.message, 'error');
          }
        });
        this.subscriptions.push(sub); // Add subscription to array
      }
    });
  }
}
