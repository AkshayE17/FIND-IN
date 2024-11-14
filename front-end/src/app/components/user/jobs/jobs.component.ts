import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../common/footer/footer.component';
import { selectAllJobs } from '../../../state/job/job.selector';
import { Store } from '@ngrx/store';
import { IJob, JobState } from '../../../state/job/job.state';
import { JobService } from '../../../services/job.service';
import { Observable, of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/userService';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, FooterComponent],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
  jobs$: Observable<IJob[]>;
  totalJobs: number = 0;
  pageSize: number = 5;
  currentPage: number = 1;
  loading = false;

  filters = {
    jobType: '',
    category: '',
    startSalary: '',
    endSalary: '',
    search: '',
    location: ''
  };

  jobTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid'];
  categories = ['Technology', 'Marketing', 'Sales', 'Design', 'Finance', 'Other'];
  isFiltersVisible = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private store: Store<JobState>, private router: Router, private jobService: JobService,private userService: UserService) {
    this.jobs$ = this.store.select(selectAllJobs);
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(page: number = 1) {
    this.loading = true;

    this.jobService.getAllJobs(
      page,
      this.pageSize,
      this.filters.search,
      this.filters.jobType,
      this.filters.category,
      this.filters.startSalary,
      this.filters.endSalary,
      this.filters.location
    )
    .pipe(takeUntil(this.unsubscribe$))  
    .subscribe({
      next: (data) => {
        this.jobs$ = of(data.jobs);
        this.totalJobs = data.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading jobs:', error);
      }
    });
  }

  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }

  onSearch(event: Event) {
    const search = (event.target as HTMLInputElement).value;
    this.filters.search = search;
    this.loadJobs(1);
  }

  applyFilters() {
    this.currentPage = 1;
    this.loadJobs(1);
  }

  resetFilters() {
    this.filters = {
      jobType: '',
      category: '',
      startSalary: '',
      endSalary: '',
      search: '',
      location: ''
    };
    this.loadJobs(1);
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

  applyForJob(jobId: string) {
    this.userService.getProfessionalDetails().subscribe((detailsExist) => {
      console.log('Professional details exist:', detailsExist);
      if (Array.isArray(detailsExist)&&detailsExist.length > 0) {
        this.router.navigate(['/user/job-details', jobId]);
      } else {
        Swal.fire({
          title: 'Complete Professional Details',
          text: 'Please complete your professional details to apply for jobs. Would you like to add them now?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, add details',
          cancelButtonText: 'Not now',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/user/dashboard/professional-details']);
          }
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
