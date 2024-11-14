import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AppState } from '../state/app.state';
import { selectUserAccessToken, selectUserRole } from '../state/user/user.selector';
import { selectAdminAccessToken, selectAdminRole } from '../state/admin/admin.selector';
import { selectRecruiterAccessToken, selectRecruiterRole } from '../state/recruiter/recruiter.selector';
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {

  // Inject dependencies in functional interceptors
  const store = inject(Store<AppState>);
  const router = inject(Router);

  // Get token and role observables based on request URL
  const { token$, role$ } = getTokenAndRoleForRequest(req, store);

  // Pipe token and role observables
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

          // Handle the request and catch errors
          return next(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
              if (error.status === 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Your session has expired. Please log in again.',
                })
                router.navigate(['/']);
              } else if (error.status === 401) {
                alert('Your session has expired. Please log in again.');
                router.navigate(['/login']);
              }
              return throwError(() => error);
            })
          );
        })
      )
    )
  );
};

// Function to get token and role based on the request URL
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
