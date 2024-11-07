import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobService } from '../../../services/jobService';
import { UserService } from '../../../services/userService';
import { IJobResponse } from '../../../state/job/job.state';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-applied-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applied-jobs.component.html',
  styleUrls: ['./applied-jobs.component.scss']
})
export class AppliedJobsComponent implements OnInit, OnDestroy {
  appliedJobs: IJobResponse[] = [];
  expandedIndex: number = -1;
  private unsubscribe$ = new Subject<void>();

  constructor(private jobService: JobService, private userService: UserService) {}

  ngOnInit(): void {
    this.fetchAppliedJobs();
  }

  fetchAppliedJobs(): void {
    const userId = this.userService.getUserId();
    this.jobService.getAppliedJobs(userId)
      .pipe(takeUntil(this.unsubscribe$))  // Unsubscribe when the component is destroyed
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
