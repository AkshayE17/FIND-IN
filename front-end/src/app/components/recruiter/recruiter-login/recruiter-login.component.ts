import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loginRecruiter } from '../../../state/recruiter/recruiter.action';
import { AppState } from '../../../state/app.state';
import { selectRecruiterLoading, selectRecruiterError, selectRecruiter } from '../../../state/recruiter/recruiter.selector';
import { BaseLoginComponent, LoginPageConfig } from '../../reusable/base-login/base-login.component';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recruiter-login',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, BaseLoginComponent,CommonModule],
  templateUrl: './recruiter-login.component.html',
  styleUrl: './recruiter-login.component.scss'
})
export class RecruiterLoginComponent implements OnInit, OnDestroy {
  loginConfig: LoginPageConfig = {
    title: 'Recruiter Login',
    subtitle: 'Please authenticate to continue',
    welcomeTitle: 'Welcome Recruiter!',
    welcomeMessage: 'Connect with top talent and build your dream team with our platform.',
    brandIcon: '👩‍💼',
    backgroundImage: '/assets/Recruiter.jpg',
    signUpRoute: '/recruiter/register'
  };

  loading$: Observable<boolean|null>;
  error$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private router: Router
  ) {
    this.loading$ = this.store.select(selectRecruiterLoading);
    this.error$ = this.store.select(selectRecruiterError);  
  }

  ngOnInit(): void {
    this.store.select(selectRecruiter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(recruiter => {
        if (recruiter) {
          this.showSuccessAlert();
          this.router.navigate(['/']);
        }
      });
  }

  onSubmit(credentials: {email: string, password: string}) {
    this.store.dispatch(loginRecruiter({ credentials }));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}