import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { OtpVerifyComponent } from '../otp-verify/otp-verify.component';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Component({
  selector: 'app-recruiter-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './recruiter-register.component.html',
  styleUrls: ['./recruiter-register.component.scss']
})
export class RecruiterRegisterComponent {
  registerForm: FormGroup;
  loading$ = new BehaviorSubject<boolean>(false);
  error$: Observable<string>;


  constructor(private fb: FormBuilder, private http: HttpClient, private dialog: MatDialog) {
      this.registerForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        officialEmail: ['', [Validators.required, Validators.email]],
        einNumber: ['', [Validators.required, Validators.pattern('^[0-9]{2}-[0-9]{7}$')]],  // Example EIN format: 12-3456789
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        companyName: ['', Validators.required],
        companyWebsite: ['', [Validators.required, Validators.pattern('https?://.+')]],
        jobTitle: ['', Validators.required],
        gender: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
      this.error$ = of('');
    
  }

  // Custom Validators
  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
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

        this.http.post('http://localhost:8888/recruiter/register', recruiterData).subscribe({
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

}
