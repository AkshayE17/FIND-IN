import { Component, OnInit, OnDestroy } from '@angular/core';
import { IJob } from '../../../state/job/job.state';
import { CommonModule } from '@angular/common';
import { Observable, of, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { JobService } from '../../../services/jobService';
import { RecruiterService } from '../../../services/recruiterService';

@Component({
  selector: 'app-manage-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss'],
})
export class ManageJobsComponent implements OnInit, OnDestroy {
  jobs$: Observable<IJob[]> = new Observable<IJob[]>();
  totalJobs: number = 0;
  pageSize: number = 3;
  currentPage: number = 1;
  loading = false;

  filters = {
    searchTerm: '',
    jobType: ''
  };
  
  jobTypeOptions = [
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' }
  ];

  private subscriptions: Subscription = new Subscription();

  constructor(private jobService: JobService, private recruiterService: RecruiterService) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe from all subscriptions
  }

  loadJobs(page: number = 1) {
    const recruiterId = this.recruiterService.getRecruiterId();
    this.loading = true;
    
    const jobSubscription = this.jobService.getRecruiterJobs(
      recruiterId,
      page,
      this.pageSize,
      this.filters.searchTerm,
      this.filters.jobType
    ).subscribe({
      next: (data) => {
        this.jobs$ = of(data.jobs);
        this.totalJobs = data.total;
        this.currentPage = page;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching jobs:', error);
      }
    });

    this.subscriptions.add(jobSubscription);
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
    Swal.fire({
      title: 'Edit Job Details',
      html: `
        <div style="text-align: left;">
          <label>Job Title</label>
          <input type="text" id="jobTitle" class="swal2-input" placeholder="Job Title" value="${job.jobTitle}">
  
          <label>Job Type</label>
          <select id="jobType" class="swal2-input">
            ${this.jobTypeOptions.map(option => 
              `<option value="${option.value}" ${job.jobType === option.value ? 'selected' : ''}>${option.label}</option>`
            ).join('')}
          </select>
  
          <label>Job Category</label>
          <input type="text" id="jobCategory" class="swal2-input" placeholder="Job Category" value="${job.jobCategory}">
  
          <label>Job Description</label>
          <textarea id="jobDescription" class="swal2-textarea" placeholder="Job Description">${job.jobDescription}</textarea>
  
          <label>Experience Required</label>
          <input type="number" id="experienceRequired" class="swal2-input" placeholder="Experience Required" value="${job.experienceRequired}">
  
          <label>Location</label>
          <input type="text" id="location" class="swal2-input" placeholder="Location" value="${job.location}">
  
          <label>Salary</label>
          <input type="number" id="salary" class="swal2-input" placeholder="Salary" value="${job.salary}">
        </div>
      `,
      focusConfirm: false,
      width: 600,
      preConfirm: () => {
        const jobTitle = (document.getElementById('jobTitle') as HTMLInputElement).value;
        const jobType = (document.getElementById('jobType') as HTMLSelectElement).value;
        const jobCategory = (document.getElementById('jobCategory') as HTMLInputElement).value;
        const jobDescription = (document.getElementById('jobDescription') as HTMLTextAreaElement).value;
        const experienceRequired = Number((document.getElementById('experienceRequired') as HTMLInputElement).value);
        const location = (document.getElementById('location') as HTMLInputElement).value;
        const salary = Number((document.getElementById('salary') as HTMLInputElement).value);
        
        return { jobTitle, jobType, jobCategory, jobDescription, experienceRequired, location, salary };
      }
    }).then(result => {
      if (result.isConfirmed) {
        const updatedJob = {
          ...job,
          jobTitle: result.value?.jobTitle,
          jobType: result.value?.jobType,
          jobCategory: result.value?.jobCategory,
          jobDescription: result.value?.jobDescription,
          experienceRequired: result.value?.experienceRequired,
          location: result.value?.location,
          salary: result.value?.salary,
        };
        
        const updateJobSubscription = this.jobService.updateJob(job._id, updatedJob).subscribe(
          () => {
            Swal.fire('Success', 'Job updated successfully', 'success');
            this.loadJobs(this.currentPage);
          },
          error => Swal.fire('Error', 'Unable to update job', 'error')
        );

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
}
