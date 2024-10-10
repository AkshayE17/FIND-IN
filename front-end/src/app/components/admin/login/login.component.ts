import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../state/app.state';
import { loginAdmin } from '../../../state/admin/admin.action';
import { selectAdminLoading, selectAdminError, selectAdmin } from '../../../state/admin/admin.selector';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { IAdmin } from '../../../state/admin/admin.state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  admin$: Observable<IAdmin | null>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router
  ) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.store.select(selectAdminLoading);
    this.error$ = this.store.select(selectAdminError);
    this.admin$ = this.store.select(selectAdmin);
  }

  ngOnInit(): void {
    this.error$.subscribe((errorMessage) => {
      if (errorMessage) {
        this.showErrorAlert(errorMessage);
      }
    });

    this.admin$.subscribe((admin) => {
      if (admin) {
        this.showSuccessAlert();
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      const credentials = this.loginForm.value;
      this.store.dispatch(loginAdmin({ credentials }));
    }
  }

  showErrorAlert(errorMessage: string) {
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: errorMessage,
      confirmButtonText: 'Retry',
    });
  }

  showSuccessAlert() {
    Swal.fire({
      icon: 'success',
      title: 'Login Successful',
      text: 'Welcome back, Admin!',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
    });
  }
}
