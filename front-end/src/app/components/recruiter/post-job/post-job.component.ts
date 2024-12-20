import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IJob, IJobCategory } from '../../../state/job/job.state';
import { createJob } from '../../../state/job/job.action';
import Swal from 'sweetalert2';
import { JobService } from '../../../services/job.service';
import { selectCompanyDetails } from '../../../state/recruiter/recruiter.selector';
import { ICompany } from '../../../state/recruiter/recruiter.state';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { loadCompanyDetails } from '../../../state/recruiter/recruiter.action';
import { AuthService } from '../../../services/auth.service';
import { RecruiterService } from '../../../services/recruiter.service';



@Component({
  selector: 'app-post-job',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-job.component.html',
  styleUrls: ['./post-job.component.scss'],
})
export class PostJobComponent implements OnInit, OnDestroy {
  companyDetails$!: Observable<ICompany | null>;
  jobForm: FormGroup;
  jobCategories: string[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private authService: AuthService,
    private jobService: JobService,
    private recruiterService: RecruiterService,
    private router: Router
  ) {
    this.jobForm = this.fb.group({
      jobTitle: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9]+(?:[\s\-][a-zA-Z0-9]+)*$/), // Letters, numbers, spaces, and hyphens
        ],
      ],
      jobType: ['', Validators.required],
      jobCategory: ['', Validators.required],
      skills: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9]+(?:,\s?[a-zA-Z0-9]+)*$/), // Letters, numbers, and commas
        ],
      ],
      experienceRequired: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/), // Positive integers only
          Validators.min(0),
        ],
      ],
      location: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]+(?:[\s\-][a-zA-Z]+)*$/), // Letters, spaces, and hyphens
        ],
      ],
      salary: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/), // Positive numbers only
          Validators.min(0),
        ],
      ],
      jobDescription: [
        '',
        [Validators.required, Validators.minLength(10)], // Minimum length 10
      ],
    });
    
    
  }

  ngOnInit(): void {
    this.companyDetails$ = this.store.select(selectCompanyDetails);

    const accessToken = this.authService.getRecruiterAccessToken();
    const recruiterId = this.authService.getRecruiterId();

    if (accessToken && recruiterId) {
      this.store.dispatch(loadCompanyDetails({ accessToken, recruiterId }));
    }
    this.companyDetails$ = this.store.select(selectCompanyDetails);
    this.jobService.getJobCategories()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (categories: IJobCategory[]) => {
          console.log('Fetched categories:', categories);
          this.jobCategories = categories.map((category) => category.name);
        },
        (error) => console.error('Error fetching job categories', error)
      );
  }

  navigateToCompanyDetails() {
    this.router.navigate(['recruiter/dashboard/company-details']);
  }

  onSubmit() {
    if (this.jobForm.valid) {
      console.log("form is valid");
      const job: IJob = { ...this.jobForm.value };
      const recruiterId = this.authService.getRecruiterId();

      if (recruiterId) {
        job.recruiterId = recruiterId;

        this.recruiterService.getCompanyIdForRecruiter()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(
            (companyId) => {
              if (companyId) {
                job.companyId = companyId;
                this.store.dispatch(createJob({ job }));
                this.jobForm.reset();

                Swal.fire({
                  title: 'Success!',
                  text: 'The job has been added successfully.',
                  icon: 'success',
                  confirmButtonText: 'OK',
                });
              } else {
                Swal.fire({
                  title: 'Error!',
                  text: 'Company ID could not be retrieved.',
                  icon: 'error',
                  confirmButtonText: 'OK',
                });
              }
            },
            (error) => {
              Swal.fire({
                title: 'Error!',
                text: 'Failed to retrieve company ID.',
                icon: 'error',
                confirmButtonText: 'OK',
              });
            }
          );
      }
    }
  }

  createNewJob() {
    this.jobForm.reset();
  }

  ngOnDestroy(): void {
    // Complete the observable to unsubscribe from all active subscriptions
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
