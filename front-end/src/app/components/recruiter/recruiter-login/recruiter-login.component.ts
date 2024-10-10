import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loginRecruiter } from '../../../state/recruiter/recruiter.action';
import { AppState } from '../../../state/app.state';
import { selectRecruiterLoading, selectRecruiterError, selectRecruiter } from '../../../state/recruiter/recruiter.selector'
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { IRecruiter } from '../../../state/recruiter/recruiter.state';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';

@Component({
  selector: 'app-recruiter-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './recruiter-login.component.html',
  styleUrls: ['./recruiter-login.component.scss'],
})
export class RecruiterLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  recruiter$: Observable<IRecruiter | null>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.store.select(selectRecruiterLoading);
    this.error$ = this.store.select(selectRecruiterError);
    this.recruiter$ = this.store.select(selectRecruiter);
  }

  ngOnInit(): void {
    // Subscribe to error$ and show SweetAlert if there's an error
    this.error$.subscribe((errorMessage) => {
      if (errorMessage) {
        this.showErrorAlert(errorMessage);
      }
    });

    this.recruiter$.subscribe((recruiter) => {
      if (recruiter) {
        this.showSuccessAlert();
        this.router.navigate(['/']);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      const credentials = this.loginForm.value;
      this.store.dispatch(loginRecruiter({ credentials }));
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
      text: 'Welcome back, recruiter!',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
    });
  }
}
