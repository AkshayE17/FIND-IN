import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-change-password',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-change-password.component.html',
  styleUrl: './user-change-password.component.scss'
})
export class UserChangePasswordComponent {
  passwordForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$'
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword === confirmPassword) {
      form.get('confirmPassword')?.setErrors(null);
    } else {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    }
  }

  isFieldInvalid(fieldName: string): string | null {
    const field = this.passwordForm.get(fieldName);
    if (field?.hasError('required') && (field.dirty || field.touched)) {
      return 'This field is required';
    }
    if (field?.hasError('minlength') && (field.dirty || field.touched)) {
      return 'Password must be at least 8 characters long';
    }
    if (field?.hasError('pattern') && (field.dirty || field.touched)) {
      return 'Password must contain at least one uppercase, one lowercase, one number, and one special character';
    }
    return null;
  }
  

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
  
      const { currentPassword, newPassword } = this.passwordForm.value;
      const userId = this.authService.getUserId();
      if (!userId) {
        Swal.fire('Error', 'Authentication error. Please log in again.', 'error');
        this.isSubmitting = false;
        return;
      }
  
      this.userService
        .changePassword({ currentPassword, newPassword, userId })
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Password changed successfully.', 'success');
            this.passwordForm.reset();
            this.isSubmitting = false;
          },
          error: (err) => {
            Swal.fire('Error', err.message || 'Failed to change password.', 'error');
            this.isSubmitting = false;
          },
        });
    } else {
      Object.keys(this.passwordForm.controls).forEach((key) => {
        const control = this.passwordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
  
}
