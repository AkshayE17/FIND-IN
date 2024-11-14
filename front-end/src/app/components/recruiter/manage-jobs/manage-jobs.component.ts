import { Component, OnInit, OnDestroy } from '@angular/core';
import { IJob } from '../../../state/job/job.state';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
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
          console.log("data is :", data.jobs);
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
    this.searchSubject.next(searchTerm); // Emit the search term to trigger the debounce
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
  showUpdateForm(job: any): void {
    const formStyles = `
      <style>
        .custom-swal-form {
          text-align: left;
          margin: 1rem 0;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #333;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          margin-top: 0.25rem;
        }
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #1a237e;
          outline: none;
          box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.2);
        }
        .swal2-popup {
          width: 40em !important;
        }
        .currency-prefix {
          position: relative;
        }
        .currency-prefix input {
          padding-left: 1.5rem;
        }
        .currency-prefix::before {
          content: "₹";
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        .error-message {
          color: #f44336;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      </style>
    `;

    Swal.fire({
      title: 'Edit Job Details',
      html: `
        ${formStyles}
        <div class="custom-swal-form">
          <div class="form-group">
            <label for="jobTitle">Job Title*</label>
            <input 
              type="text" 
              id="jobTitle" 
              class="swal2-input" 
              placeholder="Enter job title" 
              value="${job.jobTitle || ''}"
              required
            >
          </div>

          <div class="form-group">
            <label for="jobType">Job Type*</label>
            <select id="jobType" class="swal2-input" required>
              ${this.jobTypeOptions.map(option => 
                `<option value="${option.value}" ${job.jobType === option.value ? 'selected' : ''}>
                  ${option.label}
                </option>`
              ).join('')}
            </select>
          </div>

          <div class="form-group">
            <label for="jobCategory">Job Category*</label>
            <input 
              type="text" 
              id="jobCategory" 
              class="swal2-input" 
              placeholder="Enter job category"
              value="${job.jobCategory || ''}"
              required
            >
          </div>

          <div class="form-group">
            <label for="jobDescription">Job Description*</label>
            <textarea 
              id="jobDescription" 
              class="swal2-textarea" 
              placeholder="Enter detailed job description"
              required
            >${job.jobDescription || ''}</textarea>
          </div>

          <div class="form-group">
            <label for="experienceRequired">Experience Required (in years)*</label>
            <input 
              type="number" 
              id="experienceRequired" 
              class="swal2-input" 
              placeholder="Enter required experience"
              value="${job.experienceRequired || 0}"
              min="0"
              step="0.5"
              required
            >
          </div>

          <div class="form-group">
            <label for="location">Location*</label>
            <input 
              type="text" 
              id="location" 
              class="swal2-input" 
              placeholder="Enter job location"
              value="${job.location || ''}"
              required
            >
          </div>

          <div class="form-group">
            <label for="salary">Salary (₹ per annum)*</label>
            <div class="currency-prefix">
              <input 
                type="number" 
                id="salary" 
                class="swal2-input" 
                placeholder="Enter annual salary"
                value="${job.salary || 0}"
                min="0"
                step="1000"
                required
              >
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Job',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1a237e',
      cancelButtonColor: '#64748b',
      width: '800px',
      focusConfirm: false,
      preConfirm: () => {
        const fields = {
          jobTitle: document.getElementById('jobTitle') as HTMLInputElement,
          jobType: document.getElementById('jobType') as HTMLSelectElement,
          jobCategory: document.getElementById('jobCategory') as HTMLInputElement,
          jobDescription: document.getElementById('jobDescription') as HTMLTextAreaElement,
          experienceRequired: document.getElementById('experienceRequired') as HTMLInputElement,
          location: document.getElementById('location') as HTMLInputElement,
          salary: document.getElementById('salary') as HTMLInputElement
        };

        // Validation
        for (const [key, field] of Object.entries(fields)) {
          if (!field.value.trim()) {
            Swal.showValidationMessage(`Please enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
          }
        }

        return {
          jobTitle: fields.jobTitle.value,
          jobType: fields.jobType.value,
          jobCategory: fields.jobCategory.value,
          jobDescription: fields.jobDescription.value,
          experienceRequired: Number(fields.experienceRequired.value),
          location: fields.location.value,
          salary: Number(fields.salary.value)
        };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const updatedJob = {
          ...job,
          ...result.value
        };
        
        const updateJobSubscription = this.jobService.updateJob(job._id, updatedJob).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Job updated successfully',
              icon: 'success',
              confirmButtonColor: '#1a237e'
            });
            this.loadJobs(this.currentPage);
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: 'Unable to update job. Please try again.',
              icon: 'error',
              confirmButtonColor: '#f44336'
            });
            console.error('Error updating job:', error);
          }
        });

        this.subscriptions.add(updateJobSubscription);
      }
    });
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

  showApplicants(job: IJob) {
    console.log("show candidate button triggered");
    if (job.applicants && job.applicants.length > 0) {
      this.isApplicantsModalVisible = true;
      this.selectedJobId = job._id ?? '';
      this.selectedJobApplicants = job.applicants.map((applicant) => ({
        _id: applicant._id,
        userId: {
          _id: applicant.userId.id,
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
      console.log("Modal visible:", this.isApplicantsModalVisible);
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
