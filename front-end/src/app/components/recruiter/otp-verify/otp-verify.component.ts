import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, EventEmitter, Inject, OnInit, OnDestroy, Output, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
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
export class OtpVerifyComponent implements OnInit, OnDestroy, AfterViewInit {
  otpForm: FormGroup;
  errorMessage: string = '';
  timeLeft: number = 120; 
  timerSubscription: Subscription | null = null;
  showCloseConfirmation: boolean = false;
  
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;
  @Output() close = new EventEmitter<void>();
  @Output() verify = new EventEmitter<string>();
  
  private data: any;
  
  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    @Inject(MAT_DIALOG_DATA) public dialogData: OtpDialogData,
    private dialogRef: MatDialogRef<OtpVerifyComponent>,
    private router: Router
  ) {
    // Prevent closing the dialog when clicking outside
    dialogRef.disableClose = true;

    this.otpForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    });
  }
  
  // Method to handle incoming data
  setData(data: any): void {
    this.data = data;
    console.log('Received data:', data);
  }

  ngOnInit() {
    this.startTimer();
    
    // Override the default backdrop click behavior
    this.dialogRef.backdropClick().subscribe(event => {
      this.openCloseConfirmation();
      event.preventDefault();
      event.stopPropagation();
    });
  }

  ngAfterViewInit() {
    this.setupInputEventListeners();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  openCloseConfirmation() {
    this.showCloseConfirmation = true;
  }

  // Confirm closing the modal
  confirmClose() {
    this.dialogRef.close(false);
  }

  // Cancel closing the modal
  cancelClose() {
    this.showCloseConfirmation = false;
  }

  // Setup input event listeners for navigation and backspace
  setupInputEventListeners() {
    this.otpInputs.forEach((input, index) => {
      const inputElement = input.nativeElement;
      
      // Handle input navigation
      inputElement.addEventListener('input', (event: Event) => {
        const value = (event.target as HTMLInputElement).value;
        if (value && index < 5) {
          this.otpInputs.toArray()[index + 1].nativeElement.focus();
        }
      });

      // Handle backspace to move to previous input
      inputElement.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Backspace') {
          const inputElement = event.target as HTMLInputElement;
          
          // If current input is empty, move to previous input and clear its value
          if (inputElement.value === '' && index > 0) {
            const prevInput = this.otpInputs.toArray()[index - 1].nativeElement;
            prevInput.value = '';
            prevInput.focus();
            
            // Update form control value
            const controlName = `digit${index}`;
            const prevControlName = `digit${index + 1}`;
            this.otpForm.get(prevControlName)?.setValue('');
          }
        }
      });
    });
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
    this.dialogRef.close(false);
  }

  resendOtp() {
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