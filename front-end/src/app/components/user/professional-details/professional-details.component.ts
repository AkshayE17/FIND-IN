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
    console.log("triggering the load professional details")
    this.userService.getProfessionalDetails()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (details) => {
          console.log("professional details",details);
          let normalizedDetails = null;
          if (Array.isArray(details)) {
            normalizedDetails = details.length > 0 ? details[0] : null;
          } else if (details && Object.keys(details).length > 0) {
            normalizedDetails = details;
          }
          
          this.professionalDetails$.next(normalizedDetails);
          this.isLoading.next(false);
        },
        error: (err) => {
          console.error('Error loading professional details:', err);
          this.professionalDetails$.next(null);
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

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
  
      if (!validTypes.includes(file.type)) {
        this.error = 'Invalid file type. Only PDF, DOC, and DOCX are allowed.';
        this.selectedFile = null;
      } else if (file.size > maxSize) {
        this.error = 'File size exceeds the 5MB limit.';
        this.selectedFile = null;
      } else {
        this.error = null;
        this.selectedFile = file;
      }
    }
  }

  async onSubmit() {
    Object.keys(this.detailsForm.controls).forEach(field => {
      const control = this.detailsForm.get(field);
      control?.markAsTouched();
    });

    if (this.detailsForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the errors in the form before submitting.',
        confirmButtonText: 'OK'
      });
      return;
    }

    let professionalDetails = {...this.detailsForm.value};
    
    if (typeof professionalDetails.skills === 'string') {
      professionalDetails.skills = professionalDetails.skills
        .split(',')
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill);
    }

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

  getFileName(url: string | undefined): string | null {
    if (!url) {
      return null;
    }
    return url.split('/').pop() || null;
  }
  
  private saveProfessionalDetails(professionalDetails: IProfessionalDetails) {
    this.isLoading.next(true);

    if (this.professionalDetails$.value) {
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
    this.isEditing = !this.isEditing;
    this.detailsForm.reset({
      title: '',
      skills: '',
      experience: 0,
      currentLocation: '',
      expectedSalary: 0,
      about: ''
    });
    this.selectedFile = null;
    this.error = null;
  }
}