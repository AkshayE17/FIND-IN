import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/authservice';
import { loginAdmin, loginAdminSuccess, loginAdminFailure } from './admin.action';
import { IAdmin } from './admin.state';

@Injectable()
export class AdminEffects {
  constructor(private actions$: Actions, private authService: AuthService) {}

  loginAdmin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginAdmin),
      switchMap(({ credentials }) =>
        this.authService.loginAdmin(credentials).pipe(
          map((admin) => loginAdminSuccess({ admin })), 
          catchError((error) => of(loginAdminFailure({ error: 'Invalid username or password' })))
        )
      )
    )
  );
}
