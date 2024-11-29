import { Component, OnInit, OnDestroy } from '@angular/core';
import { IJob } from '../../../state/job/job.state';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { JobService } from '../../../services/job.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppliedCandidatesComponent } from '../applied-candidates/applied-candidates.component';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, AppliedCandidatesComponent],
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss'],
})
export class ManageJobsComponent implements OnInit, OnDestroy {
  jobs$: Observable<IJob[]> = new Observable<IJob[]>();
  totalJobs: number = 0;
  pageSize: number = 3;
  currentPage: number = 1;
  loading = false;

  isApplicantsModalVisible = false;
  selectedJobId = '';
  selectedJobApplicants: any[] = [];

  filters = {
    searchTerm: '',
    jobType: '',
  };

  isUpdateModalVisible = false;
  currentJob: IJob = {
    jobTitle: '',
    jobType: '',
    jobCategory: '',
    jobDescription: '',
    location: '',
    experienceRequired: '0', 
    skills: [],
    salary: '0' 
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  
    // Only add this subscription if it's not already observed
    if (!this.searchSubject.observed) {
      this.subscriptions.add(
        this.searchSubject.pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap((searchTerm) => {
            this.filters.searchTerm = searchTerm;
            return this.jobService.getRecruiterJobs(
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
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadJobs(page: number = 1) {
    if (!this.searchSubject.observed) {
      this.loading = true;

      const jobSubscription = this.jobService
        .getRecruiterJobs(
          this.authService.getRecruiterId(),
          page,
          this.pageSize,
          this.filters.searchTerm,
          this.filters.jobType
        )
        .subscribe({
          next: (data) => {
            console.log("data is :", data);
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
  showUpdateForm(job: IJob): void {
    this.currentJob = { ...job };
    this.isUpdateModalVisible = true;
  }


  confirmDelete(jobId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(result => {
      if (result.isConfirmed) {
        const deleteJobSubscription = this.jobService.deleteJob(jobId).subscribe(
          () => {
            Swal.fire('Deleted!', 'The job has been deleted.', 'success');
            this.loadJobs(this.currentPage);
          },
          error => Swal.fire('Error', 'Unable to delete job', 'error')
        );

        this.subscriptions.add(deleteJobSubscription);
      }
    });
  }

  onJobUpdate(jobUpdateForm: NgForm): void {
    if (jobUpdateForm.valid) {
      this.loading = true;
      this.jobService.updateJob(this.currentJob._id, this.currentJob).subscribe(
        (response) => {
          Swal.fire('Success', 'Job updated successfully!', 'success');
          this.isUpdateModalVisible = false;
          
          // Trigger search subject with current filters
          this.searchSubject.next(this.filters.searchTerm);
          
          this.loading = false;
        },
        (error) => {
          Swal.fire('Error', 'Failed to update job. Please try again.', 'error');
          this.loading = false;
        }
      );
    }
  }
  


  cancelUpdate(): void {
    this.isUpdateModalVisible = false;
  }

  showApplicants(job: IJob) {
    console.log("show candidate button triggered");
    if (job.applicants && job.applicants.length > 0) {
      this.isApplicantsModalVisible = true;
      this.selectedJobId = job._id ?? '';
      this.selectedJobApplicants = job.applicants.map((applicant) => ({
        _id: applicant._id,
        userId: {
          _id: applicant.userId._id,
          name: applicant.userId.name,
          email: applicant.userId.email,
          mobile: applicant.userId.mobile,
          gender: applicant.userId.gender,
          password: applicant.userId.password,
          isVerified: applicant.userId.isVerified,
          isBlocked: applicant.userId.isBlocked,
          imageUrl: applicant.userId.imageUrl,
          createdAt: applicant.userId.createdAt,
          updatedAt: applicant.userId.updatedAt,
          jobs: applicant.userId.jobs,
          professionalDetails: applicant.userId.professionalDetails
            ? {
                _id: applicant.userId.professionalDetails._id,
                userId: applicant.userId.professionalDetails.userId,
                title: applicant.userId.professionalDetails.title,
                skills: applicant.userId.professionalDetails.skills,
                experience: applicant.userId.professionalDetails.experience,
                currentLocation: applicant.userId.professionalDetails.currentLocation,
                expectedSalary: applicant.userId.professionalDetails.expectedSalary,
                about: applicant.userId.professionalDetails.about,
                resumeUrl: applicant.userId.professionalDetails.resumeUrl
              }
            : undefined,
        },
        appliedDate: applicant.appliedDate,
        applicationStatus: applicant.applicationStatus,
      }));
    
      console.log("Selected applicants:", this.selectedJobApplicants);
    } else {
      Swal.fire('No Applicants', 'This job has no applicants yet.', 'info');
    }
  }

  hideApplicantsModal() {
    this.isApplicantsModalVisible = false;
    this.loadJobs(this.currentPage);
  }
}
 