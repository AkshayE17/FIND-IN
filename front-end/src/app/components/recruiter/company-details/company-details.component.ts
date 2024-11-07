import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICompany } from '../../../state/recruiter/recruiter.state';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { RecruiterService } from '../../../services/recruiterService';
import { selectCompanyDetails } from '../../../state/recruiter/recruiter.selector';
import { loadCompanyDetails, setCompanyDetails } from '../../../state/recruiter/recruiter.action';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit, OnDestroy {
  companyDetails$!: Observable<ICompany | null>;
  companyForm!: FormGroup;
  isEditing = false;
  hasDetails = false;
  
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  constructor(private fb: FormBuilder, private store: Store, private recruiterService: RecruiterService) {}

  ngOnInit() {
    this.companyDetails$ = this.store.select(selectCompanyDetails);
    this.initForm();

    const accessToken = this.recruiterService.getAccessToken();
    const recruiterId = this.recruiterService.getRecruiterId();

    if (accessToken && recruiterId) {
      this.store.dispatch(loadCompanyDetails({ accessToken, recruiterId }));
    }

    const detailsSub = this.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        if (details) {
          this.hasDetails = true;
          this.companyForm.patchValue(details);
          this.isEditing = false;
        } else {
          this.hasDetails = false;
          this.isEditing = false; 
        }
      });
      
    this.subscription.add(detailsSub);
  }

  initForm() {
    this.companyForm = this.fb.group({
      companyName: ['', Validators.required],
      companyWebsite: ['', [Validators.required, Validators.pattern('https?://.+')]],
      contactNumber: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      about: ['', [Validators.required, Validators.minLength(50)]],
      logo: ['']
    });
  }

  startEditing() {
    this.isEditing = true;
  }

  cancelEditing() {
    Swal.fire({
      title: 'Are you sure?',
      text: "Your changes will be discarded!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isEditing = false;
        this.companyDetails$
          .pipe(takeUntil(this.destroy$))
          .subscribe(details => {
            if (details) {
              this.companyForm.patchValue(details);
            }
          });
      }
    });
  }

  onSubmit() {
    if (this.companyForm.valid) {
      const companyDetails: ICompany = this.companyForm.value;
      const accessToken = this.recruiterService.getAccessToken();
      const recruiterId = this.recruiterService.getRecruiterId();

      if (accessToken && recruiterId) {
        const submitSub = this.recruiterService.addOrUpdateCompanyDetails(companyDetails, accessToken, recruiterId)
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (response) => {
              this.store.dispatch(setCompanyDetails({ companyDetails }));
              this.isEditing = false;
              this.hasDetails = true;

              Swal.fire({
                title: 'Success!',
                text: 'Company details saved successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
              });
            },
            (error) => {
              Swal.fire({
                title: 'Error!',
                text: 'There was a problem saving the company details.',
                icon: 'error',
                confirmButtonText: 'Try Again'
              });
            }
          );
          
        this.subscription.add(submitSub);
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Access token or recruiter ID is missing.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } else {
      Swal.fire({
        title: 'Invalid Form',
        text: 'Please fill all required fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  ngOnDestroy() {
    // Complete the destroy$ subject to trigger unsubscription in takeUntil
    this.destroy$.next();
    this.destroy$.complete();


    this.subscription.unsubscribe();
  }
}
