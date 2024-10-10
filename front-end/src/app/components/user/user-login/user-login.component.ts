import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loginUser } from '../../../state/user/user.action';
import { AppState } from '../../../state/app.state';
import { selectUserLoading, selectUserError, selectUser } from '../../../state/user/user.selector';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../state/user/user.state';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  user$: Observable<IUser | null>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<AppState>,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.loading$ = this.store.select(selectUserLoading);
    this.error$ = this.store.select(selectUserError);
    this.user$ = this.store.select(selectUser);
  }

  ngOnInit(): void {
   
    this.error$.subscribe((errorMessage) => {
        if (errorMessage) {
            this.showErrorAlert(errorMessage); 
        }
    });

    this.user$.subscribe((user) => {
        if (user) {
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
      this.store.dispatch(loginUser({ credentials }));
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
      text: 'Welcome back!',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
    });
  }
}
