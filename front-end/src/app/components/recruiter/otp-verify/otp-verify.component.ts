import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription, timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface OtpDialogData {
  email: string;
}

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [MatDialogActions, MatDialogModule, MatFormFieldModule, ReactiveFormsModule, CommonModule, MatInputModule, HttpClientModule],
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.scss']
})
export class OtpVerifyComponent implements OnInit, OnDestroy {
  [x: string]: any;
  otpForm: FormGroup;
  errorMessage: string = '';
  timeLeft: number = 120; // 2 minutes in seconds
  timerSubscription: Subscription | null = null;
  
  
  @Output() close = new EventEmitter<void>();
  @Output() verify = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    @Inject(MAT_DIALOG_DATA) public data: OtpDialogData,
  private dialogRef: MatDialogRef<OtpVerifyComponent>,
    private router:Router
  ) {
    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
  }

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startTimer() {
    this.timerSubscription = timer(0, 1000)
      .pipe(takeWhile(() => this.timeLeft > 0))
      .subscribe(() => {
        this.timeLeft--;
        if (this.timeLeft === 0) {
          this.errorMessage = 'OTP has expired. Please request a new one.';
        }
      });
  }

  onInput(event: Event, digit: number) {
    const input = event.target as HTMLInputElement;
    if (input.value && digit < 6) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  }

  async onSubmitOtp() {
    if (this.otpForm.valid && this.timeLeft > 0) {
      const otp = Object.values(this.otpForm.value).join('');
      const email = this.data.email; 
  
      try {
        const response = await this.http.post<string>('http://localhost:8888/recruiter/verify-otp', { email, otp }).toPromise();
        
        this.verify.emit(response); 
        
        this.dialogRef.close(true); 
        
        this.router.navigate(['/recruiter/verify-success']); 
      } catch (error) {
        this.errorMessage = 'Invalid OTP. Please try again.';
        console.error('Error verifying OTP', error);
      }
    } else if (this.timeLeft === 0) {
      this.errorMessage = 'OTP has expired. Please request a new one.';
    }
  }
  

  onClose() {
    this.dialogRef.close();
}

  resendOtp() {
    // Reset the timer
    this.timeLeft = 120;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.startTimer();
    this.otpForm.reset();
    this.errorMessage = '';
  
    this.http.post('http://localhost:8888/recruiter/resend-otp', { email: this.data.email })
      .toPromise()
      .then(response => {
        console.log('OTP resent successfully', response);
      })
      .catch(error => {
        this.errorMessage = 'Error resending OTP. Please try again.';
        console.error('Error resending OTP', error);   
      });
  }
  

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}