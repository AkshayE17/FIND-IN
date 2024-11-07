import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AdminService } from '../../services/adminService';
import { loginAdmin, loginAdminSuccess, loginAdminFailure } from './admin.action';
import { IAdmin, LoginResponse } from './admin.state';

@Injectable()
export class AdminEffects {
  constructor(private actions$: Actions, private adminService: AdminService) {}

  loginAdmin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginAdmin),
      mergeMap(({ credentials }) =>
        this.adminService.login(credentials).pipe(
          map((response:LoginResponse) => loginAdminSuccess({ admin:response.admin,
             accessToken:response.accessToken,
             refreshToken:response.refreshToken
           })), 
          catchError((error) => of(loginAdminFailure({ error: 'Invalid username or password' })))
        )
      )
    )
  );      
}
