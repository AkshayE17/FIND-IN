import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { UserService } from '../../services/userService';
import * as UserActions from './user.action';
import { IProfessionalDetails, LoginResponse } from './user.state';
import { CookieService } from 'ngx-cookie-service'; 
import { AuthService } from '../../services/auth.service';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private authService: AuthService,
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
              role:'user'
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
        const user = this.authService.getUserData(); 
        const accessToken = this.cookieService.get('accessToken'); 

        if (user && accessToken ) {
          return UserActions.loginUserSuccess({
            user,
            accessToken,
            role:'user'
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
