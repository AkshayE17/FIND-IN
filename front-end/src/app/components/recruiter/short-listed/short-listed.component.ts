import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { JobService } from '../../../services/job.service';
import { IJob } from '../../../state/job/job.state';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

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
    private router: Router
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
            console.log("data:",data)
            this.jobs$ = of(data.jobs);
            this.totalJobs = data.total;
            this.currentPage = page; 
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            console.error('Error fetching jobs:', error);
          },
        });

      this.subscriptions.add(jobSubscription);
    }
  }

  onSearchChange(searchTerm: string) {
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
    // Navigate to chat component with both IDs
    this.router.navigate(['/chat'], {
      queryParams: {
        recruiterId: this.authService.getRecruiterId(),
        userId: userId
      }
    });
  }
  joinVideoCall(applicant: any) {
    // Handle the video call functionality here
  }
}
