import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { RecruiterService } from '../../services/recruiter.service';
import { loginRecruiter, loginRecruiterSuccess, loginRecruiterFailure, addOrUpdateCompanyDetails, addOrUpdateCompanyDetailsSuccess, addOrUpdateCompanyDetailsFailure, loadCompanyDetails, updateRecruiterProfile, updateRecruiterProfileSuccess, updateRecruiterProfileFailure } from './recruiter.action';
import { LoginResponse } from './recruiter.state';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class RecruiterEffects {
  constructor(
    private actions$: Actions,
    private recruiterService: RecruiterService,
    private authService: AuthService,
    private cookieService: CookieService 
  ) {}


  loginRecruiter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginRecruiter),
      mergeMap(({ credentials }) =>
        this.recruiterService.login(credentials).pipe(
          map((response: LoginResponse) => 
            loginRecruiterSuccess({
              recruiter: response.recruiter,
              accessToken: response.accessToken,
              role:'recruiter'
            })
          ),
          catchError((error) => 
            of(loginRecruiterFailure({ error: error.message || 'Login failed' })) 
          )
        )
      )
    )
  );

  loadRecruiterFromCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[App] Initialize'), 
      map(() => {
        const recruiter = this.authService.getRecruiterData(); 
        const accessToken = this.cookieService.get('recruiterAccessToken');

        if (recruiter && accessToken) {
          return loginRecruiterSuccess({
            recruiter,
            accessToken,
            role:'recruiter'
          });
        } else {
          return { type: '[Recruiter] No Action' };
        }
      })
    )
  );

  updateRecruiterProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRecruiterProfile),
      mergeMap(({ recruiter }) =>
        this.recruiterService.updateRecruiterProfile(recruiter).pipe(
          map(() => updateRecruiterProfileSuccess({ recruiter })),
          catchError((error) =>
            of(updateRecruiterProfileFailure({ error: error.message || 'Failed to update user' }))
          )
        )
      )
    )
  );

  loadCompanyDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadCompanyDetails),
      tap(() => console.log('Effect triggered: loadCompanyDetails')),
      mergeMap(({ accessToken, recruiterId }) =>
        this.recruiterService.getCompanyDetails(accessToken, recruiterId).pipe(
          map((companyDetails) => {
            console.log('API call success:', companyDetails);
            return addOrUpdateCompanyDetailsSuccess({ companyDetails });
          }),
          catchError((error) => {
            console.error('API call failed:', error);
            return of(addOrUpdateCompanyDetailsFailure({ error: error.message || 'Failed to load company details' }));
          })
        )
      )
    )
  );

  addOrUpdateCompanyDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addOrUpdateCompanyDetails),
      mergeMap(({ companyDetails, accessToken, recruiterId }) =>
        this.recruiterService.addOrUpdateCompanyDetails(companyDetails, accessToken, recruiterId).pipe(
          map((updatedCompanyDetails) => addOrUpdateCompanyDetailsSuccess({ companyDetails: updatedCompanyDetails })),
          catchError((error) => of(addOrUpdateCompanyDetailsFailure({ error: error.message || 'Failed to update company details' })))
        )
      )
    )
  );
}
