import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { JobService } from '../../../services/job.service';
import { IJob } from '../../../state/job/job.state';
import { AuthService } from '../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'; 
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
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  
    console.log('Setting up search subscription');
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          console.log('Search Subject Triggered:', searchTerm);
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
          console.log('Search API Response:', data);
          this.jobs$ = of(data.jobs);
          this.totalJobs = data.total;
          this.loading = false;
        },
        error: (error) => {
          console.error('Search API Error:', error);
          this.loading = false;
          this.snackBar.open('Failed to fetch jobs', 'Close', { duration: 3000 });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadJobs(page: number = 1) {
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
          this.jobs$ = of(data.jobs);3
          this.totalJobs = data.total;
          this.currentPage = page;
          this.loading = false;
        },
        error: (error) => {
          console.error('Detailed Error fetching jobs:', error);
          this.loading = false;
          this.snackBar.open('Failed to fetch jobs', 'Close', { duration: 3000 });
        },
      });
  
    this.subscriptions.add(jobSubscription);
  }

  hasApplicants(job: IJob | undefined): boolean {
    return !!job?.applicants && job.applicants.length > 0;
  }
  

  onSearchChange(searchTerm: string) {
    console.log('Search Term Changed:', searchTerm);
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
    this.router.navigate(['recruiter/dashboard/chat']);
  }
  

  joinVideoCall() {
    this.router.navigate(['recruiter/dashboard/video-call']);
  }
   
}