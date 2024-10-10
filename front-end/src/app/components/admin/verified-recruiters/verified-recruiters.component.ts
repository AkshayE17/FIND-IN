import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { AuthService } from '../../../services/authservice';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verified-recruiters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verified-recruiters.component.html',
  styleUrl: './verified-recruiters.component.scss'
})
export class VerifyRecruitersComponent implements OnInit {
  pendingRecruiters$: Observable<IRecruiter[]> = new Observable<IRecruiter[]>();
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadPendingRecruiters();
  }

  loadPendingRecruiters() {
    this.loading = true;
    this.pendingRecruiters$ = this.authService.getPendingRecruiters();
    this.pendingRecruiters$.subscribe({
      complete: () => this.loading = false
    });
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    
  }

  viewDetails(recruiter: IRecruiter) {
    this.router.navigate(['/recruiter/details', recruiter.email]);
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
        this.authService.approveRecruiter(recruiter.email).subscribe({
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
        this.authService.rejectRecruiter(recruiter.email).subscribe({
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
      }
    });
  }
}