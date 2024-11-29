  import { Component } from '@angular/core';
  import { Subject, takeUntil } from 'rxjs';
  import { JobService } from '../../../services/job.service';
  import { AuthService } from '../../../services/auth.service';
  import { IJobResponse } from '../../../state/job/job.state';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-short-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './short-list.component.html',
    styleUrl: './short-list.component.scss'
  })
  export class ShortListComponent {
    appliedJobs: IJobResponse[] = [];
    expandedIndex: number = -1;
    private unsubscribe$ = new Subject<void>();

    constructor(private jobService: JobService,private authService:AuthService) {}

    ngOnInit(): void {
      this.fetchAppliedJobs();
    }

    fetchAppliedJobs(): void {
      const userId = this.authService.getUserId();
      this.jobService.getShortlistedJobs(userId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (jobs: IJobResponse[]) => {
            this.appliedJobs = jobs;
            console.log("jobs:", this.appliedJobs);
          },
          (error) => {
            console.error('Error fetching applied jobs:', error);
          }
        );
    }

    toggleDetails(index: number): void {
      this.expandedIndex = this.expandedIndex === index ? -1 : index;
    }

    ngOnDestroy(): void {
      // Clean up subscriptions to avoid memory leaks
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
