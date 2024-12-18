import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../common/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../common/footer/footer.component';
import { selectAllJobs } from '../../../state/job/job.selector';
import { Store } from '@ngrx/store';
import { IJob, IJobResponse, JobState } from '../../../state/job/job.state';
import { JobService } from '../../../services/job.service';
import { Observable, of, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [HeaderComponent, CommonModule, FormsModule, FooterComponent],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
  jobs$: Observable<IJobResponse[]>;
  totalJobs: number = 0;
  pageSize: number = 5;
  currentPage: number = 1;
  loading = false;
  salaryError: string | null = null;

  filters = {
    jobType: '',
    category: '',
    startSalary: '',
    endSalary: '',
    search: '',
    location: ''
  };

  jobTypes = ['Full-time', 'Part-time', 'Remote', 'Hybrid'];
  categories: string[] = [];

  isFiltersVisible = false;

  private unsubscribe$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private store: Store<JobState>, private router: Router, private jobService: JobService, private userService: UserService,private route:ActivatedRoute) {
    this.jobs$ = this.store.select(selectAllJobs).pipe(
      map((jobs: IJob[]) =>
        jobs.map((job) => ({
          ...job,
          recruiterId: job.recruiterId,
          companyId: job.companyId, 
          applicants: job.applicants?.map(applicant => applicant._id) ?? [],
        }) as IJobResponse)
      )
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.filters.search = params['search'];
      }
      this.loadJobs();
    });
    this.loadCategories();
     this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged(), 
      takeUntil(this.unsubscribe$)
    ).subscribe((searchValue) => {
      this.filters.search = searchValue;
      this.loadJobs(1); 
    });
  }


  loadCategories(): void {
    this.userService.getJobCategories().subscribe({
      next: (categories: any[]) => { // Assuming the backend returns an array of objects
        this.categories = categories.map(category => category.name); // Extract only the 'name'
      },
      error: (err) => {
        console.error('Failed to load categories', err);
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
          this.jobs$ = of(data.jobs);
          this.totalJobs = data.total;
          this.currentPage = page;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading jobs:', error);
          this.loading = false;
        },
      });
  }
  
  toggleFilters() {
    this.isFiltersVisible = !this.isFiltersVisible;
  }
  onSearch(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchValue); 
  }

  validateSalaryRange(): void {
    const startSalary = Number(this.filters.startSalary);
    const endSalary = Number(this.filters.endSalary);
  
    if (startSalary && endSalary && endSalary <= startSalary) {
      this.salaryError = "Maximum salary must be greater than minimum salary.";
    } else {
      this.salaryError = null;
    }
  }
  
  applyFilters(): void {
    this.validateSalaryRange();
    if (!this.salaryError) {
      this.currentPage = 1;
      this.loadJobs(1);
    } else {
      Swal.fire({
        title: 'Invalid Salary Range',
        text: 'Please ensure the maximum salary is greater than the minimum salary.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
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
    this.userService.getProfessionalDetails().pipe(
      catchError((error) => {
        console.error('Error fetching professional details:', error);
        if (error.status === 401) {
      
          Swal.fire({
            title: 'Login Required',
            text: 'You need to log in to apply for jobs. Would you like to log in now?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, log in',
            cancelButtonText: 'Not now',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/user/login']).catch((navError) => {
                console.error('Navigation error:', navError);
                Swal.fire({
                  title: 'Navigation Error',
                  text: 'Unable to navigate to the login page. Please try again later.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                });
              });
            }
          });
        } else {
          // Handle other API errors
          Swal.fire({ 
            title: 'Error',
            text: 'An error occurred while fetching your professional details. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
        // Stop the chain by returning an empty observable
        return of(null); 
      })
    ).subscribe((detailsExist) => {
      if (detailsExist && Array.isArray(detailsExist) && detailsExist.length > 0) {
        this.router.navigate(['/user/job-details', jobId]);
      } else if (detailsExist !== null) {
        Swal.fire({
          title: 'Complete Professional Details',
          text: 'Please complete your professional details to apply for jobs. Would you like to add them now?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, add details',
          cancelButtonText: 'Not now',
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/user/dashboard/professional-details']).catch((navError) => {
              console.error('Navigation error:', navError);
              Swal.fire({
                title: 'Navigation Error',
                text: 'Unable to navigate to the professional details page. Please try again later.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            });
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
