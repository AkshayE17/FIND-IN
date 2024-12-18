import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppState } from '../../../state/app.state';
import { IUser } from '../../../state/user/user.state';
import { selectUser } from '../../../state/user/user.selector';
import { UserService } from '../../../services/user.service';
import { AdminService } from '../../../services/admin.service';
import { updateUserProfile } from '../../../state/user/user.action';
import { take, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user$!: Observable<IUser | null>;
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
    mobile: [
      { type: 'required', message: 'Phone number is required' },
      { type: 'pattern', message: 'Invalid phone number format' }
    ],
    gender: [
      { type: 'required', message: 'Gender selection is required' }
    ],
    image: [
      { type: 'fileSize', message: 'Image must be less than 5MB' },
      { type: 'fileType', message: 'Only JPG, PNG, and GIF images are allowed' }
    ]
  };

  constructor(
    private store: Store<AppState>, 
    private userService: UserService,
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
      mobile: ['', [
        Validators.required,
        Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{10}$/)
      ]],
      gender: ['', Validators.required],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.user$ = this.store.select(selectUser);
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          mobile: user.mobile,
          gender: user.gender,
          imageUrl: user.imageUrl
        });
        this.imagePreview = user.imageUrl || '/assets/user (2).png';
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
      this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
        if (user) {
          this.profileForm.patchValue({
            name: user.name,
            mobile: user.mobile,
            gender: user.gender,
            imageUrl: user.imageUrl
          });
          this.imagePreview = user.imageUrl || '/assets/user (2).png';
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
  
    // Get the current user from the store
    this.user$.pipe(take(1)).subscribe(async (currentUser) => {
      if (currentUser) {
        // Prepare user details by spreading the existing user and overriding with form values
        let userDetails: IUser = {
          ...currentUser, // Spread all existing user fields
          name: this.profileForm.value.name,
          mobile: this.profileForm.value.mobile,
          gender: this.profileForm.value.gender
        };
  
        // Handle image upload if a new file is selected
        if (this.selectedImageFile) {
          try {
            // Get pre-signed URL for upload
            const response = await this.adminService.getUploadUrl(
              this.selectedImageFile.name, 
              this.selectedImageFile.type
            ).toPromise();
  
            if (response) {
              const uploadUrl = response.url;
              
              // Set the image URL (without query params)
              userDetails.imageUrl = uploadUrl.split('?')[0];
  
              // Upload file to S3
              await this.adminService.uploadFileToS3(uploadUrl, this.selectedImageFile);
            }
          } catch (error) {
            console.error('File upload failed', error);
            this.error = 'Failed to upload profile image. Please try again later.';
            Swal.fire('Error', 'Failed to upload profile image. Please try again later.', 'error');
            return;
          }
        }
  
        // Save user details
        this.saveUserProfile(userDetails);
      }
    });
  }

  private saveUserProfile(userDetails: IUser) {
    this.userService.updateUserProfile(userDetails).subscribe({
      next: (response) => {
        // Dispatch the update action
        this.store.dispatch(updateUserProfile({ user: userDetails }));
  
        // Update the cookie
        this.cookieService.set('user', JSON.stringify(userDetails), { path: '/' });
  
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
  
  get name() { return this.profileForm.get('name'); }
  get mobile() { return this.profileForm.get('mobile'); }
  get gender() { return this.profileForm.get('gender'); }
}