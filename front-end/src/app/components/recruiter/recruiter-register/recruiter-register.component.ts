import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { OtpVerifyComponent } from '../otp-verify/otp-verify.component';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recruiter-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './recruiter-register.component.html',
  styleUrls: ['./recruiter-register.component.scss']
})
export class RecruiterRegisterComponent implements OnDestroy {
  registerForm: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  error$: Observable<string>;
  private unsubscribe$ = new Subject<void>();

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      officialEmail: ['', [Validators.required, Validators.email]],
      einNumber: ['', [Validators.required, Validators.pattern('^[0-9]{2}-[0-9]{7}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      companyName: ['', Validators.required],
      companyWebsite: ['', [Validators.required, Validators.pattern('https?://.+')]],
      jobTitle: ['', Validators.required],
      gender: ['', Validators.required],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$')  // strong password pattern
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });    
    this.error$ = of('');
  }

  // Custom Validators
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDoNotMatch: true };
  }
  

  noAllZerosValidator(control: AbstractControl) {
    const mobile = control.value;
    if (/^0{10}$/.test(mobile)) {
      return { allZeros: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const recruiterData = this.registerForm.value;
      console.log("data is :", recruiterData);

      // Open the OTP verification modal immediately
      const dialogRef = this.openOtpVerificationModal();

      this.http.post('http://localhost:8888/recruiter/register', recruiterData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response) => {
            console.log('User registered successfully', response);
            dialogRef.componentInstance['setData'](recruiterData);
          },
          error: (error: any) => {
            console.error('Error registering user', error);
            dialogRef.close();
            if (error?.error?.message === 'Recruiter with this email already exists.') {
              this.showDuplicateEmailAlert();
            } else {
              this.showGenericErrorAlert();
            }
          }
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  // Modal opening method
  openOtpVerificationModal() {
    return this.dialog.open(OtpVerifyComponent, {
      data: { email: this.registerForm.value.email }
    });
  }

  showDuplicateEmailAlert() {
    Swal.fire({
      title: 'Duplicate Email',
      text: 'The email you entered is already in use. Please use a different email.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    });
  }

  showGenericErrorAlert() {
    Swal.fire({
      title: 'Error',
      text: 'An error occurred while registering. Please try again later.',
      icon: 'error',
      confirmButtonText: 'OK',
      customClass: {
        confirmButton: 'btn btn-primary'
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to avoid memory leaks
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
