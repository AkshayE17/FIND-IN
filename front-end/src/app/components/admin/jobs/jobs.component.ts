import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { JobService } from '../../../services/job.service';
import { IJobResponse } from '../../../state/job/job.state';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss'],
})
export class JobsComponent implements OnInit, OnDestroy {
  jobs: IJobResponse[] = [];
  loading = false;

  // Filters and Pagination
  filters = {
    search: '',
    jobType: '',
    category: '',
    startSalary: '',
    endSalary: '',
    location: '',
  };

  jobTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid'];
  categories: string[] = [];
  currentPage = 1;
  pageSize = 5;
  totalJobs = 0;

  private unsubscribe$ = new Subject<void>();

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadCategories();
  }

  deleteJob(jobId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this job?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.jobService.deleteJob(jobId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Job has been deleted.', 'success');
            this.loadJobs(this.currentPage); // Refresh jobs after deletion
          },
          error: (err) => {
            console.error('Error deleting job:', err);
            Swal.fire('Error', 'Failed to delete job. Please try again later.', 'error');
          },
        });
      }
    });
  }
  

  loadJobs(page: number = 1): void {
    this.loading = true;
    this.jobService
      .getAllJobs(
        page,
        this.pageSize,
        this.filters.search,
        this.filters.jobType,
        this.filters.category,
        this.filters.startSalary,
        this.filters.endSalary,
        this.filters.location
      )
      .pipe(
        takeUntil(this.unsubscribe$),
        map((data) => ({
          ...data,
          jobs: data.jobs.map((job) => ({
            ...job,
            recruiterId: job.recruiterId,
            companyId: job.companyId,
            applicants: job.applicants?.map((applicant) => applicant._id) ?? [],
          }) as IJobResponse),
        }))
      )
      .subscribe({
        next: (data) => {
          this.jobs = data.jobs; // Ensure `this.jobs` is of type `IJobResponse[]`
          this.totalJobs = data.total;
          this.currentPage = page;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading jobs:', error);
          Swal.fire('Error', 'Failed to load jobs. Please try again later.', 'error');
          this.loading = false;
        },
      });
  }
  

  loadCategories(): void {
    this.jobService.getJobCategories().subscribe({
      next: (categories: any[]) => {
        this.categories = categories.map((category) => category.name);
      },
      error: (err) => {
        console.error('Failed to load categories', err);
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  resetFilters(): void {
    this.filters = {
      search: '',
      jobType: '',
      category: '',
      startSalary: '',
      endSalary: '',
      location: '',
    };
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadJobs(page);
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalJobs / this.pageSize);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
