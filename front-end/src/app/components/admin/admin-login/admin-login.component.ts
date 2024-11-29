import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loginAdmin } from '../../../state/admin/admin.action';
import { AppState } from '../../../state/app.state';
import { selectAdminLoading, selectAdminError, selectAdmin } from '../../../state/admin/admin.selector';
import { BaseLoginComponent, LoginPageConfig } from '../../reusable/base-login/base-login.component';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../../common/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [HeaderComponent, BaseLoginComponent,CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent implements OnInit, OnDestroy {
  loginConfig: LoginPageConfig = {
    title: 'Admin Login',
    subtitle: 'Please authenticate to access the admin dashboard',
    welcomeTitle: 'Admin Portal',
    welcomeMessage: "Manage your organization's recruitment process and oversee job listings efficiently.",
    brandIcon: '👩‍💼',
    backgroundImage: '/assets/admin-dashboard.jpg',
    signUpRoute: 'mailto:support@findy.com',
    signUpText: 'Contact Support',
    forgotPasswordText: 'Reset Admin Password'
  };

  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.loading$ = this.store.select(selectAdminLoading);
    this.error$ = this.store.select(selectAdminError);
  }

  ngOnInit(): void {
    this.store.select(selectAdmin)
      .pipe(takeUntil(this.destroy$))
      .subscribe(admin => {
        if (admin) {
          this.showSuccessAlert();
          this.router.navigate(['/admin/dashboard']);
        }
      });
  }

  onSubmit(credentials: {email: string, password: string}) {
    this.store.dispatch(loginAdmin({ credentials }));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
