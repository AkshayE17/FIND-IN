import { Component, OnInit, OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { of, Observable, Subscription ,Subject} from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-verified-recruiters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verified-recruiters.component.html',
  styleUrls: ['./verified-recruiters.component.scss']
})
export class VerifyRecruitersComponent implements OnInit, OnDestroy {
  pendingRecruiters$: Observable<IRecruiter[]> = new Observable<IRecruiter[]>();
  totalRecruiters: number = 0;
  pageSize: number = 2;
  currentPage: number = 1;
  searchTerm: string = '';
  loading = false;

  filters = {
    company: '',
    startDate: '',
    endDate: '',
    searchTerm: ''
  };

  isFiltersVisible = false;
  private subscriptions: Subscription = new Subscription();
  private searchSubject = new Subject<string>();

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadPendingRecruiters();
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // Adjust the debounce time as needed
      distinctUntilChanged(),
      switchMap((term: string) => {
        this.filters.searchTerm = term;
        this.currentPage = 1; 
        return this.adminService.getPendingRecruiters(
          this.currentPage,
          this.pageSize,
          this.filters.searchTerm,
          this.filters.company,
          this.filters.startDate,
          this.filters.endDate
        );
      })
    ).subscribe({
      next: (data) => {
        this.pendingRecruiters$ = of(data.recruiters);
        this.totalRecruiters = data.total;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error!', error.message, 'error');
      }
    });
    
    this.subscriptions.add(searchSubscription);
  }


  loadPendingRecruiters(page: number = 1) {
    this.loading = true;
    const loadSubscription = this.adminService.getPendingRecruiters(
      page,
      this.pageSize,
      this.filters.searchTerm,
      this.filters.company,
      this.filters.startDate,
      this.filters.endDate
    ).subscribe({
      next: (data) => {
        this.pendingRecruiters$ = of(data.recruiters);
        this.totalRecruiters = data.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        Swal.fire('Error!', error.message, 'error');
      }
    });
    this.subscriptions.add(loadSubscription);
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadPendingRecruiters(1);
  }

  resetFilters() {
    this.filters = {
      company: '',
      startDate: '',
      endDate: '',
      searchTerm: ''
    };
    this.loadPendingRecruiters(1);
  }


  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm); // Emit search term to Subject
  }


  get totalPages(): number {
    return Math.ceil(this.totalRecruiters / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPendingRecruiters(page);
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
      <strong>Registration Date:</strong> ${new Date(recruiter.createdAt).toLocaleDateString()} <br>
    `;

    Swal.fire({
      title: 'Recruiter Details',
      html: detailsHtml,
      imageUrl: recruiter.imageUrl || 'assets/recruiter.jpg',
      imageWidth: 100,
      imageHeight: 100,
      imageAlt: 'Recruiter Image',
      confirmButtonText: 'Close'
    });
  }

  approveRecruiter(recruiter: IRecruiter) {
    Swal.fire({
      title: 'Approve Recruiter',
      text: `Are you sure you want to approve ${recruiter.email}?`,
      icon: 'question',  
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        const approveSubscription = this.adminService.approveRecruiter(recruiter.email).subscribe({
          next: () => {
            Swal.fire({
              title: 'Approved!',
              text: 'Recruiter has been successfully approved.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadPendingRecruiters();
          },
          error: (error) => {
            Swal.fire('Error!', error.message, 'error');
          }
        });
        this.subscriptions.add(approveSubscription);
      }
    });
  }

  rejectRecruiter(recruiter: IRecruiter) {
    Swal.fire({
      title: 'Reject Recruiter',
      text: `Are you sure you want to reject ${recruiter.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        const rejectSubscription = this.adminService.rejectRecruiter(recruiter.email).subscribe({
          next: () => {
            Swal.fire({
              title: 'Rejected!',
              text: 'Recruiter has been rejected.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadPendingRecruiters();
          },
          error: (error) => {
            Swal.fire('Error!', error.message, 'error');
          }
        });
        this.subscriptions.add(rejectSubscription);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
