import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { OtpVerifyComponent } from '../otp-verify/otp-verify.component';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { mobileValidator } from '../../../interceptors/numberValidator';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss']
})
export class UserRegisterComponent implements OnDestroy {
  loginForm: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  error$: Observable<string>;
  
  // New properties for password visibility
  showPassword = false;
  showConfirmPassword = false;

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog,private userService: UserService) {
    this.loginForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern("^[0-9]{10}$"), this.noAllZerosValidator],[mobileValidator(this.http,'user')]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$')
      ]],
      confirmPassword: ['', Validators.required],
      gender: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
    
    this.error$ = of('');
  }

  // Toggle password visibility methods
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    if (this.loginForm.valid) {
      const userData = this.loginForm.value;
      console.log("data is :", userData);
  
      const dialogRef = this.openOtpVerificationModal();
  
      this.loading$.next(true);
      
      this.userService.register(userData).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          console.log('User registered successfully', response);
          this.loading$.next(false);
          dialogRef.componentInstance['setData'](userData);
        },
        error: (error: any) => {
          console.error('Error registering user', error);
          this.loading$.next(false);
          dialogRef.close();
        
          const errorMessage = error?.error?.message || error?.message;
        
          if (errorMessage && errorMessage.includes('User with this email already exists')) {
            this.showDuplicateEmailAlert();
          } else {
            this.showGenericErrorAlert();
          }
        }
        
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
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

  openOtpVerificationModal() {
    const dialogRef = this.dialog.open(OtpVerifyComponent, {
      data: { email: this.loginForm.value.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('OTP verified:', result);
      }
    });

    return dialogRef;
  }
}