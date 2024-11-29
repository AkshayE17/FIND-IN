import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { JobService } from '../../../services/job.service';
import { IJob } from '../../../state/job/job.state';
import { AuthService } from '../../../services/auth.service';
import { ZegoVideoService } from '../../../services/zegoVideo.service';
import { MatSnackBar } from '@angular/material/snack-bar'; // Assuming you're using Angular Material for notifications

@Component({
  selector: 'app-short-listed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './short-listed.component.html',
  styleUrl: './short-listed.component.scss',
})
export class ShortListedComponent implements OnInit, OnDestroy {
  jobs$: Observable<IJob[]> = new Observable<IJob[]>();
  totalJobs: number = 0;
  pageSize: number = 5;
  currentPage: number = 1;
  loading = false;

  filters = {
    searchTerm: '',
    jobType: '',
  };

  searchSubject = new Subject<string>();

  jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private zegoService: ZegoVideoService,
    private snackBar: MatSnackBar // For showing notifications
  ) {}

  ngOnInit(): void {
    this.loadJobs();

    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          this.filters.searchTerm = searchTerm;
          return this.jobService.getRecruiterShortlistedJobs(
            this.authService.getRecruiterId(),
            this.currentPage,
            this.pageSize,
            this.filters.searchTerm,
            this.filters.jobType
          );
        })
      ).subscribe({
        next: (data) => {
          this.jobs$ = of(data.jobs);
          this.totalJobs = data.total;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching jobs:', error);
          this.snackBar.open('Failed to fetch jobs', 'Close', { duration: 3000 });
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadJobs(page: number = 1) {
    if (!this.searchSubject.observed) {
      this.loading = true;  

      const jobSubscription = this.jobService
        .getRecruiterShortlistedJobs(
          this.authService.getRecruiterId(),
          page,
          this.pageSize,
          this.filters.searchTerm,
          this.filters.jobType
        )
        .subscribe({
          next: (data) => {
            this.jobs$ = of(data.jobs);
            this.totalJobs = data.total;
            this.currentPage = page;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            console.error('Error fetching jobs:', error);
            this.snackBar.open('Failed to fetch jobs', 'Close', { duration: 3000 });
          },
        });

      this.subscriptions.add(jobSubscription);
    }
  }

  hasApplicants(job: IJob | undefined): boolean {
    return !!job?.applicants && job.applicants.length > 0;
  }
  
  onSearchChange(target: HTMLInputElement) {
    const searchTerm = target.value || '';
    this.searchSubject.next(searchTerm);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalJobs / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadJobs(page);
    }
  }

  openChat(userId: string) {
    // Implement chat functionality
  }
  
  joinVideoCall(applicant: any) {
    const recruiterId = this.authService.getRecruiterId();
    const roomId = `video_call_${recruiterId}_${applicant._id}`;
    
    // Start video call
    this.subscriptions.add(
      this.zegoService.joinCall(
        roomId, 
        recruiterId, 
      'Recruiter'
      ).pipe(
        catchError(error => {
          console.error('Video call error:', error);
          this.snackBar.open('Failed to start video call', 'Close', { duration: 3000 });
          return [];
        })
      ).subscribe()
    );
  }
}