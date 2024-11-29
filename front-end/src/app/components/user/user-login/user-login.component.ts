import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loginUser } from '../../../state/user/user.action';
import { AppState } from '../../../state/app.state';
import { selectUserLoading, selectUserError, selectUser } from '../../../state/user/user.selector';
import { BaseLoginComponent, LoginPageConfig } from '../../reusable/base-login/base-login.component';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, BaseLoginComponent,CommonModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.scss'
})
export class UserLoginComponent implements OnInit, OnDestroy {
  loginConfig: LoginPageConfig = {
    title: 'Job Seeker Login',
    subtitle: 'Please enter your details to continue',
    welcomeTitle: 'Welcome Back!',
    welcomeMessage: 'Find your dream job and take the next step in your career journey.',
    brandIcon: '✋',
    backgroundImage: '/assets/jobseeker.jpg',
    signUpRoute: '/user/register'
  };

  loading$: Observable<boolean|null>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) { 
    this.loading$ = this.store.select(selectUserLoading);
    this.error$ = this.store.select(selectUserError);
  } 

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.showSuccessAlert();
          this.router.navigate(['/']);
        }
      });
  }

  onSubmit(credentials: {email: string, password: string}) {
    this.store.dispatch(loginUser({ credentials }));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
