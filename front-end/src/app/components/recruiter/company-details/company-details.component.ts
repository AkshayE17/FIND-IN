import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICompany } from '../../../state/recruiter/recruiter.state';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { selectCompanyDetails } from '../../../state/recruiter/recruiter.selector';
import { loadCompanyDetails, setCompanyDetails } from '../../../state/recruiter/recruiter.action';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { RecruiterService } from '../../../services/recruiter.service';

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

constructor(private fb: FormBuilder, private store: Store, private authService:AuthService,private adminService: AdminService,private recruiterService: RecruiterService) {}
 
  ngOnInit() {
    this.companyDetails$ = this.store.select(selectCompanyDetails);
    this.initForm();

    const accessToken = this.authService.getRecruiterAccessToken();
    const recruiterId = this.authService.getRecruiterId();

    if (accessToken && recruiterId) {
      this.store.dispatch(loadCompanyDetails({ accessToken, recruiterId }));
    }

    const detailsSub = this.companyDetails$
      .pipe(takeUntil(this.destroy$))
      .subscribe(details => {
        if (details) {
          console.log('Company details loaded:', details);
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
      logo: [null]
    });
  }

  startEditing() {
    this.isEditing = true;
  }

  onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.getPresignedUrlAndUploadLogo(file);
    }
  }

  private getPresignedUrlAndUploadLogo(file: File) {
    this.adminService.getUploadUrl(file.name, file.type)
      .subscribe(
        async (response) => {
          const uploadUrl = response.url;

          const cleanedUrl = uploadUrl.split('?')[0];
  
          try {
            await this.uploadLogoToS3(uploadUrl, file);
            this.companyForm.patchValue({ logo: cleanedUrl });
  
  
          } catch (error) {
            console.error('File upload failed:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to upload logo. Please try again later.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        },
        (error) => {
          console.error('Error getting presigned URL:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to get upload URL. Please try again later.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      );
  }
  
  private async uploadLogoToS3(url: string, file: File): Promise<void> {
    try {
      await this.adminService.uploadFileToS3(url, file);
    } catch (error) {
      throw new Error('Upload to S3 failed');
    }
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
      const accessToken = this.authService.getRecruiterAccessToken();
      const recruiterId = this.authService.getRecruiterId();

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
