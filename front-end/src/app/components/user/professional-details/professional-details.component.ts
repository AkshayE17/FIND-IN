import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IProfessionalDetails } from '../../../state/user/user.state';
import { 
  FormBuilder, 
  FormGroup, 
  FormsModule, 
  ReactiveFormsModule, 
  Validators,
  AbstractControl 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-professional-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './professional-details.component.html',
  styleUrls: ['./professional-details.component.scss']
})
export class ProfessionalDetailsComponent implements OnInit, OnDestroy {
  professionalDetails$ = new BehaviorSubject<IProfessionalDetails | null>(null);
  isEditing = false;
  detailsForm!: FormGroup;
  isLoading = new BehaviorSubject<boolean>(true);
  error: string | null = null;
  private destroy$ = new Subject<void>();

  selectedFile: File | null = null;

  constructor(
    private userService: UserService,
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProfessionalDetails();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.detailsForm = this.fb.group({
      title: [
        '', 
        [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z0-9\s\-]+$/)
        ]
      ],
      skills: [
        '', 
        [
          Validators.required, 
          Validators.pattern(/^[A-Za-z0-9\s,]+$/),
          this.validateSkills
        ]
      ],
      experience: [
        0, 
        [
          Validators.required, 
          Validators.min(0), 
          Validators.max(50),
          this.validateExperience
        ]
      ],
      currentLocation: [
        '', 
        [
          Validators.required, 
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z\s]+$/)
        ]
      ],
      expectedSalary: [
        0, 
        [
          Validators.required, 
          Validators.min(1000),
          Validators.max(10000000),
          this.validateSalary
        ]
      ],
      about: [
        '', 
        [
          Validators.required, 
          Validators.minLength(10),
          Validators.maxLength(500)
        ]
      ],
      resume: [null]
    });
  }

  // Custom validators
  private validateSkills(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const skills = control.value.split(',').map((skill: string) => skill.trim());
    
    if (skills.length > 10) {
      return { 'maxSkills': true };
    }
    
    const invalidSkills = skills.filter((skill: string) => 
      skill.length < 2 || skill.length > 30
    );
    
    return invalidSkills.length > 0 ? { 'invalidSkillLength': true } : null;
  }

  private validateExperience(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    
    if (value === null || value === undefined) return null;
    
    if (value < 0) return { 'negativeExperience': true };
    if (value > 50) return { 'excessiveExperience': true };
    
    // Ensure only 0.5 increments
    if (!Number.isInteger(value * 2)) {
      return { 'invalidExperienceIncrement': true };
    }
    
    return null;
  }

  private validateSalary(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    
    if (value === null || value === undefined) return null;
    
    if (value < 1000) return { 'belowMinimumSalary': true };
    if (value > 10000000) return { 'excessiveSalary': true };
    
    return null;
  }

  private loadProfessionalDetails() {
    this.isLoading.next(true);
    this.userService.getProfessionalDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          if (Array.isArray(details) && details.length > 0) {
            details = details[0];  // Assume we only need the first item if it's an array
          }
          
          if (details && typeof details === 'object') {
            console.log('Professional details loaded:', details);
            this.professionalDetails$.next(details);
          } else {
            this.error = 'No professional details available';
          }
          
          this.isLoading.next(false);
        },
        error: (err) => {
          console.error('Error loading professional details:', err);
          this.error = 'Failed to load professional details. Please try again later.';
          this.isLoading.next(false);
        }
      });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.professionalDetails$.value) {
      this.detailsForm.patchValue({
        ...this.professionalDetails$.value,
        skills: Array.isArray(this.professionalDetails$.value.skills) 
          ? this.professionalDetails$.value.skills.join(', ') 
          : this.professionalDetails$.value.skills
      });
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      if (file.size <= 5242880) { // 5MB limit
        this.selectedFile = file;
        this.error = null;
      } else {
        this.error = 'File size exceeds 5MB limit.';
        this.selectedFile = null;
      }
    } else {
      this.error = 'Please upload a valid PDF or Word document (DOC/DOCX).';
      this.selectedFile = null;
    }
  }

  async onSubmit() {
    // Mark all fields as touched to trigger validation display
    Object.keys(this.detailsForm.controls).forEach(field => {
      const control = this.detailsForm.get(field);
      control?.markAsTouched();
    });

    // Check form validity
    if (this.detailsForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the errors in the form before submitting.',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Prepare professional details
    let professionalDetails = {...this.detailsForm.value};
    
    // Convert skills to array
    if (typeof professionalDetails.skills === 'string') {
      professionalDetails.skills = professionalDetails.skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill);
    }

    // File upload handling
    if (this.selectedFile) {
      try {
        const response = await this.adminService.getUploadUrl(this.selectedFile.name, this.selectedFile.type).toPromise();
        if (response) {
          const uploadUrl = response.url;
          
          professionalDetails.resumeUrl = uploadUrl.split('?')[0];

          await this.adminService.uploadFileToS3(uploadUrl, this.selectedFile);
        }
      } catch (error) {
        console.error('File upload failed', error);
        this.error = 'Failed to upload resume. Please try again later.';
        Swal.fire('Error', 'Failed to upload resume. Please try again later.', 'error');
        return;
      }
    }

    this.saveProfessionalDetails(professionalDetails);
  }

  private saveProfessionalDetails(professionalDetails: IProfessionalDetails) {
    this.isLoading.next(true);

    if (this.professionalDetails$.value) {
      // Update existing professional details
      this.userService.updateProfessionalDetails(professionalDetails)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isEditing = false;
            this.professionalDetails$.next(response);
            this.isLoading.next(false);
            Swal.fire('Success', 'Professional details updated successfully!', 'success');
          },
          error: (error) => {
            console.error('Error updating professional details:', error);
            this.error = 'Failed to update professional details. Please try again later.';
            this.isLoading.next(false);
            Swal.fire('Error', 'Failed to update professional details. Please try again later.', 'error');
          }
        });
    } else {
      // Create new professional details
      this.userService.createProfessionalDetails(professionalDetails)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isEditing = false;
            this.professionalDetails$.next(response);
            this.isLoading.next(false);
            Swal.fire('Success', 'Professional details created successfully!', 'success');
          },
          error: (error) => {
            console.error('Error creating professional details:', error);
            this.error = 'Failed to create professional details. Please try again later.';
            this.isLoading.next(false);
            Swal.fire('Error', 'Failed to create professional details. Please try again later.', 'error');
          }
        });
    }
  }

  startAdding() {
    console.log('Start adding triggered');
    this.isEditing = true;
    this.detailsForm.reset();
    this.selectedFile = null;
    this.error = null;
  }
}