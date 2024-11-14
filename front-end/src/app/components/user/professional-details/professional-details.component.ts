import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IProfessionalDetails } from '../../../state/user/user.state';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/userService';
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
  

  private initForm() {
    this.detailsForm = this.fb.group({
      title: [
        '', 
        [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]
      ],
      skills: [
        '', 
        [Validators.required, Validators.pattern(/^[A-Za-z\s,]+$/)]
      ],
      experience: [
        0, 
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      currentLocation: [
        '', 
        [Validators.required, Validators.pattern(/^[^\s]+(\s+[^\s]+)*$/)]
      ],
      expectedSalary: [
        0, 
        [Validators.required, Validators.min(1)]
      ],
      about: [
        '', 
        [Validators.required, Validators.maxLength(500)]
      ],
      resume: [null]
    });
  }
  

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.professionalDetails$.value) {
      this.detailsForm.patchValue(this.professionalDetails$.value);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && (file.type === 'application/pdf' || 
                 file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      this.selectedFile = file;
    } else {
      this.error = 'Please upload a valid PDF or Word document (DOC/DOCX).';
      this.selectedFile = null;
    }
  }

  async onSubmit() {
    if (this.detailsForm.valid) {
      let professionalDetails = this.detailsForm.value;

      if (this.selectedFile) {
        try {
          const response = await this.adminService.getUploadUrl(this.selectedFile.name, this.selectedFile.type).toPromise();
          if(response){
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
    console.log('Start adding triggered');
    this.isEditing = true;
    this.detailsForm.reset();
  }
}
