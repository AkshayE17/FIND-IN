import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { ActivatedRoute } from '@angular/router';
import { IJobResponse } from '../../../state/job/job.state';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-jobs-details',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, FormsModule, CommonModule],
  templateUrl: './jobs-details.component.html',
  styleUrls: ['./jobs-details.component.scss']
})
export class JobsDetailsComponent implements OnInit, OnDestroy {
  jobId: string;
  job: IJobResponse | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private jobService: JobService,
    private router: Router,
    private authService: AuthService
  ) {
    this.jobId = this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadJobDetails();
  }

  loadJobDetails() {
    this.jobService.getJobDetails(this.jobId)
      .pipe(takeUntil(this.unsubscribe$)) 
      .subscribe(
        (job: IJobResponse) => {
          this.job = job;

          const recruiterName = this.job?.recruiterId?.name;
          const companyName = this.job?.companyId?.companyName;

          console.log('Recruiter Name:', recruiterName);
          console.log('Company Name:', companyName);
        },
        (error) => {
          console.error("Error fetching job details:", error);
          Swal.fire({
            title: 'Error!',
            text: 'Could not fetch job details. Please try again later.',
            icon: 'error',
            confirmButtonText: 'Okay'
          });
        }
      );
  }

  applyForJob() {
    const userId = this.authService.getUserId();
  
    this.jobService.applyForJob(this.jobId, userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => {
          this.router.navigate(['/']);
          Swal.fire({
            title: 'Application Successful!',
            text: 'You have applied for the job successfully.',
            icon: 'success',
            confirmButtonText: 'Okay'
          });
        },
        (error) => {
          console.error('Error applying for job:', error);
  
          if (error.status === 409 && error.error.message === 'You have already applied for this job.') {
            Swal.fire({
              title: 'Error!',
              text: 'You have already applied for this job.',
              icon: 'warning',
              confirmButtonText: 'Okay'
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Could not apply for the job. Please try again later.',
              icon: 'error',
              confirmButtonText: 'Okay'
            });
          }
        }
      );
  }
  
  

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
