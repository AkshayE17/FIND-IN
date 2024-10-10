import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../services/authservice';
import * as UserActions from './user.action';

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private authService: AuthService) {}

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUser),
      mergeMap(({ credentials }) =>
        this.authService.loginUser(credentials).pipe(
          map((user) => UserActions.loginUserSuccess({ user })),
          catchError((error) => of(UserActions.loginUserFailure({ error: error.error.message || 'Login failed' })))
        )
      )
    )
  );
}
