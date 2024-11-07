import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { IProfessionalDetails } from '../../../state/user/user.state';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/userService';
import { takeUntil } from 'rxjs/operators';

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

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadProfessionalDetails();
  }

  ngOnDestroy() {
    // Trigger unsubscription on component destroy
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProfessionalDetails() {
    this.isLoading.next(true);
    this.userService.getProfessionalDetails()
      .pipe(takeUntil(this.destroy$)) // Automatically unsubscribe when component is destroyed
      .subscribe({
        next: (details) => {
          if (details && (!Array.isArray(details) || details.length > 0)) {
            this.professionalDetails$.next(Array.isArray(details) ? details[0] : details);
          } else {
            this.error = 'No professional details available';
            this.professionalDetails$.next(null);
          }
          this.isLoading.next(false);
        },
        error: (err) => {
          console.error('Error loading professional details:', err);
          this.error = 'Failed to load professional details. Please try again later.';
          this.isLoading.next(false);
          this.professionalDetails$.next(null);
        }
      });
  }

  private initForm() {
    this.detailsForm = this.fb.group({
      title: ['', Validators.required],
      skills: ['', Validators.required],
      experience: [0, [Validators.required, Validators.min(0)]],
      currentLocation: ['', Validators.required],
      expectedSalary: [0, [Validators.required, Validators.min(0)]],
      about: [''],
      resume: [null]
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.professionalDetails$.pipe(takeUntil(this.destroy$)).subscribe(details => {
        if (details) {
          this.detailsForm.patchValue({
            title: details.title,
            skills: details.skills.join(', '),
            experience: details.experience,
            currentLocation: details.currentLocation,
            expectedSalary: details.expectedSalary,
            about: details.about
          });
        }
      });
    }
  }

  startAdding() {
    console.log('Start adding triggered');
    this.isEditing = true;
    this.detailsForm.reset();
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.detailsForm.patchValue({
        resume: file
      });
    }
  }

  onSubmit() {
    if (this.detailsForm.valid) {
      const formData = this.detailsForm.value;
      const professionalDetails: IProfessionalDetails = {
        ...formData,
        skills: formData.skills.split(',').map((skill: string) => skill.trim())
      };
      
      this.isLoading.next(true);
      this.userService.updateProfessionalDetails(professionalDetails)
        .pipe(takeUntil(this.destroy$)) // Automatically unsubscribe when component is destroyed
        .subscribe({
          next: (response) => {
            this.isEditing = false;
            this.professionalDetails$.next(response);
            this.detailsForm.reset();
            this.isLoading.next(false);
          },
          error: (error) => {
            console.error('Error updating professional details:', error);
            this.error = 'Failed to update professional details. Please try again later.';
            this.isLoading.next(false);
          }
        });
    }
  }
}
