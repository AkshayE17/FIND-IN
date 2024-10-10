import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { AuthService } from '../../../services/authservice';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiters.component.html',
  styleUrl: './recruiters.component.scss'
})
export class RecruitersComponent implements OnInit {
  recruiters$: Observable<IRecruiter[]> = new Observable<IRecruiter[]>();
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecruiters();
  }

  loadRecruiters() {
    this.loading = true;
    this.recruiters$ = this.authService.getRecruiters();
    this.recruiters$.subscribe({
      complete: () => this.loading = false
    });
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    // Implement search functionality
  }

  viewDetails(recruiter: IRecruiter) {
    this.router.navigate(['/recruiter/details', recruiter.email]);
  }

  blockRecruiter(recruiter: IRecruiter) {
    Swal.fire({
      title: 'Block Recruiter',
      text: `Are you sure you want to block ${recruiter.email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, block',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.blockRecruiter(recruiter.email).subscribe({
          next: () => {
            Swal.fire({
              title: 'Blocked!',
              text: 'Recruiter has been successfully blocked.',
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
      }
    });
  }
}
