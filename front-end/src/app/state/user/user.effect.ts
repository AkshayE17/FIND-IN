import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { UserService } from '../../services/userService';
import * as UserActions from './user.action';
import { IProfessionalDetails, LoginResponse } from './user.state';
import { CookieService } from 'ngx-cookie-service'; 

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private cookieService: CookieService 
  ) {}


  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUser),
      mergeMap(({ credentials }) =>
        this.userService.login(credentials).pipe(
          map((response: LoginResponse) =>
            UserActions.loginUserSuccess({
              user: response.user,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            })
          ),
          catchError((error) =>
            of(
              UserActions.loginUserFailure({
                error: error?.error?.message || 'Login failed',
              })
            )
          )
        )
      )
    )
  );

  loadUserFromCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[App] Initialize'), 
      map(() => {
        const user = this.userService.getUserData(); 
        const accessToken = this.cookieService.get('accessToken'); 
        const refreshToken = this.cookieService.get('refreshToken');

        if (user && accessToken && refreshToken) {
          return UserActions.loginUserSuccess({
            user,
            accessToken,
            refreshToken,
          });
        } else {
          return { type: '[User] No Action' };
        }
      })
    )
  );

  loadProfessionalDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadProfessionalDetails),
      mergeMap(() =>
        this.userService.getProfessionalDetails().pipe(
          map((professionalDetails: IProfessionalDetails) =>
            UserActions.loadProfessionalDetailsSuccess({ professionalDetails })
          ),
          catchError((error) =>
            of(UserActions.loadProfessionalDetailsFailure({ error: error.message || 'Failed to load details' }))
          )
        )
      )
    )
  );

  updateProfessionalDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateProfessionalDetails),
      mergeMap(({ professionalDetails }) =>
        this.userService.updateProfessionalDetails(professionalDetails).pipe(
          map(() =>
            UserActions.updateProfessionalDetailsSuccess({ professionalDetails })
          ),
          catchError((error) =>
            of(UserActions.updateProfessionalDetailsFailure({ error: error.message || 'Failed to update details' }))
          )
        )
      )
    )
  );
}
