import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AuthService } from '../../services/authservice';
import { loginRecruiter, loginRecruiterSuccess, loginRecruiterFailure } from './recruiter.action';

@Injectable()
export class RecruiterEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService 
  ) {}

  loginRecruiter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginRecruiter),
      mergeMap(({ credentials }) =>
        this.authService.loginRecruiter(credentials).pipe(
          map((recruiter) => loginRecruiterSuccess({ recruiter})),
          catchError((error) => of(loginRecruiterFailure({ error: error.message })))
        )
      )
    )
  );
}
