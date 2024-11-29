import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { loginAdmin, loginAdminSuccess, loginAdminFailure } from './admin.action';
import { IAdmin, LoginResponse } from './admin.state';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AdminEffects {
  constructor(private actions$: Actions, private adminService: AdminService,private authService:AuthService,private cookieService:CookieService) {}

  loginAdmin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginAdmin),
      mergeMap(({ credentials }) =>
        this.adminService.login(credentials).pipe(
          map((response:LoginResponse) => loginAdminSuccess({ 
            admin:response.admin,
            accessToken:response.accessToken,
            role:'admin'
  
           })), 
          catchError((error) => of(loginAdminFailure({ error: 'Invalid username or password' })))
        )
      )
    )
  );    
  
  loadAdminFromCookies$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[App] Initialize'), 
      map(() => {
        const admin = this.authService.getAdminData(); 
        const accessToken = this.cookieService.get('AdminAccessToken');

        if (admin&& accessToken) {
          return loginAdminSuccess({
            admin,
            accessToken,
            role:'admin'
          });
        } else {
          return { type: '[Recruiter] No Action' };
        }
      })
    )
  );
}
