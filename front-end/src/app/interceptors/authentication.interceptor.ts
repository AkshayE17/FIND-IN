import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUserAccessToken, selectUserRole } from '../state/user/user.selector';
import { selectAdminAccessToken, selectAdminRole } from '../state/admin/admin.selector';
import { selectRecruiterAccessToken, selectRecruiterRole } from '../state/recruiter/recruiter.selector';
import { resetRecruiterState } from '../state/recruiter/recruiter.action';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { resetAdminState } from '../state/admin/admin.action';
import { resetUserState } from '../state/user/user.action';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  // Inject dependencies
  const store = inject(Store<AppState>);
  const router = inject(Router);
  const authService = inject(AuthService);

  const { token$, role$ } = getTokenAndRoleForRequest(req, store);

  return token$.pipe(
    take(1),
    switchMap((accessToken) =>
      role$.pipe(
        take(1),
        switchMap((role) => {
          const authReq = accessToken
            ? req.clone({
                headers: req.headers
                  .set('Authorization', `Bearer ${accessToken}`)
                  .set('Role', role || ''),
              })
            : req;

          return next(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 403) {
                if (error.error && error.error.message === 'User account is blocked' || error.error.message === 'Recruiter account is blocked') {
                  Swal.fire({
                    icon: 'error',
                    title: 'Account Blocked',
                    text: 'Your account has been blocked. Please contact support for assistance.',
                  });
  
                  authService.clearRecruiterData();
                  store.dispatch(resetRecruiterState());
                  authService.clearUserData();
                  store.dispatch(resetUserState());
                  
                  router.navigate(['/']);
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Forbidden',
                    text: 'You do not have permission to access this resource.',
                  });
                  router.navigate(['/']);
                }
              } else if (error.status === 401) {
                // Handle 401 errors
                if (error.error && error.error.message && error.error.message.includes('expired')) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Unauthorized',
                    text: 'Your session has expired. Please login again.',
                  });
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Invalid Credentials',
                    text: 'The credentials you entered are incorrect.',
                  });
                }
 
                // Clear session data based on the role
                if (req.url.includes('/admin')) {
                  authService.clearAdminData();
                  store.dispatch(resetAdminState());
                  router.navigate(['/admin/login']);
                } else if (req.url.includes('/recruiter')) {
                  authService.clearRecruiterData();
                  store.dispatch(resetRecruiterState());
                  router.navigate(['/recruiter/login']);
                } else if (req.url.includes('/user')) {
                  authService.clearUserData();
                  store.dispatch(resetUserState());
                  router.navigate(['/user/login']);
                }
              }

              return throwError(() => error);
            })
          );
        })
      )
    )
  );
};

// Helper function to get token and role based on the request URL
function getTokenAndRoleForRequest(req: HttpRequest<any>, store: Store<AppState>) {
  if (req.url.includes('/admin')) {
    return {
      token$: store.select(selectAdminAccessToken),
      role$: store.select(selectAdminRole),
    };
  } else if (req.url.includes('/recruiter')) {
    return {
      token$: store.select(selectRecruiterAccessToken),
      role$: store.select(selectRecruiterRole),
    };
  } else if (req.url.includes('/user')) {
    return {
      token$: store.select(selectUserAccessToken),
      role$: store.select(selectUserRole),
    };
  } else {
    return {
      token$: of(null),
      role$: of(null),
    };
  }
}
