import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppState } from '../../../state/app.state';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { selectRecruiter } from '../../../state/recruiter/recruiter.selector';
import { RecruiterService } from '../../../services/recruiter.service';
import { AdminService } from '../../../services/admin.service';
import { updateRecruiterProfile } from '../../../state/recruiter/recruiter.action';
import { take, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-recruiter-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recruiter-details.component.html',
  styleUrls: ['./recruiter-details.component.scss']
})
export class RecruiterDetailsComponent implements OnInit, OnDestroy {
  recruiter$!: Observable<IRecruiter | null>;
  isEditing = false;
  profileForm: FormGroup;
  selectedImageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  private destroy$ = new Subject<void>();
  error: string | null = null;

  // Validation error messages
  validationMessages = {
    name: [
      { type: 'required', message: 'Name is required' },
      { type: 'minlength', message: 'Name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Name cannot exceed 50 characters' },
      { type: 'pattern', message: 'Name can only contain letters and spaces' }
    ],
    jobTitle: [
      { type: 'required', message: 'Job title is required' },
      { type: 'minlength', message: 'Job title must be at least 2 characters long' },
      { type: 'maxlength', message: 'Job title cannot exceed 100 characters' }
    ],
    email: [
      { type: 'required', message: 'Personal email is required' },
      { type: 'email', message: 'Invalid email format' }
    ],
    officialEmail: [
      { type: 'required', message: 'Official email is required' },
      { type: 'email', message: 'Invalid email format' }
    ],
    mobile: [
      { type: 'required', message: 'Phone number is required' },
      { type: 'pattern', message: 'Invalid phone number format' }
    ],
    gender: [
      { type: 'required', message: 'Gender selection is required' }
    ],
    companyName: [
      { type: 'required', message: 'Company name is required' },
      { type: 'minlength', message: 'Company name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Company name cannot exceed 100 characters' }
    ],
    companyWebsite: [
      { type: 'required', message: 'Company website is required' },
      { type: 'pattern', message: 'Invalid website URL' }
    ],
    image: [
      { type: 'fileSize', message: 'Image must be less than 5MB' },
      { type: 'fileType', message: 'Only JPG, PNG, and GIF images are allowed' }
    ]
  };

  constructor(
    private store: Store<AppState>, 
    private recruiterService: RecruiterService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private cookieService: CookieService
  ) {
    // Initialize the form with strict validators
    this.profileForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      jobTitle: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      officialEmail: ['', [
        Validators.required,
        Validators.email
      ]],
      mobile: ['', [
        Validators.required,
        Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)
      ]],
      gender: ['', Validators.required],
      companyName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      companyWebsite: ['', [
        Validators.required,
        Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)
      ]],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.recruiter$ = this.store.select(selectRecruiter);
    this.recruiter$.pipe(takeUntil(this.destroy$)).subscribe((recruiter) => {
      if (recruiter) {
        this.profileForm.patchValue({
          name: recruiter.name,
          jobTitle: recruiter.jobTitle,
          email: recruiter.email,
          officialEmail: recruiter.officialEmail,
          mobile: recruiter.mobile,
          gender: recruiter.gender,
          companyName: recruiter.companyName,
          companyWebsite: recruiter.companyWebsite,
          imageUrl: recruiter.imageUrl
        });
        this.imagePreview = recruiter.imageUrl || '/assets/user (2).png';
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle image file selection
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
  
      if (!validTypes.includes(file.type)) {
        this.error = 'Invalid file type. Only JPG, PNG, and GIF are allowed.';
        this.selectedImageFile = null;
        this.imagePreview = null;
      } else if (file.size > maxSize) {
        this.error = 'File size exceeds the 5MB limit.';
        this.selectedImageFile = null;
        this.imagePreview = null;
      } else {
        this.error = null;
        this.selectedImageFile = file;

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    
    // Reset form and image preview when canceling
    if (!this.isEditing) {
      this.recruiter$.pipe(takeUntil(this.destroy$)).subscribe((recruiter) => {
        if (recruiter) {
          this.profileForm.patchValue({
            name: recruiter.name,
            jobTitle: recruiter.jobTitle,
            email: recruiter.email,
            officialEmail: recruiter.officialEmail,
            mobile: recruiter.mobile,
            gender: recruiter.gender,
            companyName: recruiter.companyName,
            companyWebsite: recruiter.companyWebsite,
            imageUrl: recruiter.imageUrl
          });
          this.imagePreview = recruiter.imageUrl || '/assets/user (2).png';
          this.selectedImageFile = null;
          this.error = null;
        }
      });
    }
  }

  async updateProfile() {
    // Mark all form controls as touched
    Object.keys(this.profileForm.controls).forEach(field => {
      const control = this.profileForm.get(field);
      control?.markAsTouched();
    });
  
    // Check form validity
    if (this.profileForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the errors in the form before submitting.',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    // Get the current recruiter from the store
    this.recruiter$.pipe(take(1)).subscribe(async (currentRecruiter) => {
      if (currentRecruiter) {
        let recruiterDetails: IRecruiter = {
          ...currentRecruiter, // Spread all existing recruiter fields
          name: this.profileForm.value.name,
          jobTitle: this.profileForm.value.jobTitle,
          email: this.profileForm.value.email,
          officialEmail: this.profileForm.value.officialEmail,
          mobile: this.profileForm.value.mobile,
          gender: this.profileForm.value.gender,
          companyName: this.profileForm.value.companyName,
          companyWebsite: this.profileForm.value.companyWebsite
        };
        if (this.selectedImageFile) {
          try {
            const response = await this.adminService.getUploadUrl(
              this.selectedImageFile.name, 
              this.selectedImageFile.type
            ).toPromise();
  
            if (response) {
              const uploadUrl = response.url;
              recruiterDetails.imageUrl = uploadUrl.split('?')[0];
  
              await this.adminService.uploadFileToS3(uploadUrl, this.selectedImageFile);
            }
          } catch (error) {
            console.error('File upload failed', error);
            this.error = 'Failed to upload profile image. Please try again later.';
            Swal.fire('Error', 'Failed to upload profile image. Please try again later.', 'error');
            return;
          }
        }
        this.saveRecruiterProfile(recruiterDetails);
      }
    });
  }

  private saveRecruiterProfile(recruiterDetails: IRecruiter) {
    this.recruiterService.updateRecruiterProfile(recruiterDetails).subscribe({
      next: (response) => {
        // Dispatch the update action
        this.store.dispatch(updateRecruiterProfile({ recruiter: recruiterDetails }));
  
        // Update the cookie
        this.cookieService.set('recruiter', JSON.stringify(recruiterDetails), { path: '/' });
  
        // Reset editing state
        this.isEditing = false;
        this.selectedImageFile = null;
        
        // Show success message
        Swal.fire('Success', 'Profile updated successfully!', 'success');
      },
      error: (error) => {
        console.error('Profile update failed', error);
        this.error = 'Failed to update profile. Please try again later.';
        Swal.fire('Error', 'Failed to update profile. Please try again later.', 'error');
      }
    });  
  }
  
  // Getters for form controls to simplify template validation
  get name() { return this.profileForm.get('name'); }
  get jobTitle() { return this.profileForm.get('jobTitle'); }
  get email() { return this.profileForm.get('email'); }
  get officialEmail() { return this.profileForm.get('officialEmail'); }
  get mobile() { return this.profileForm.get('mobile'); }
  get gender() { return this.profileForm.get('gender'); }
  get companyName() { return this.profileForm.get('companyName'); }
  get companyWebsite() { return this.profileForm.get('companyWebsite'); }
}