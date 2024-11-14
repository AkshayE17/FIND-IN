
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router, private authService: AuthService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const userAccessToken = this.cookieService.get('accessToken');
    const recruiterAccessToken = this.cookieService.get('recruiterAccessToken');
    const adminAccessToken = this.cookieService.get('AdminAccessToken');

    console.log("User access token:", userAccessToken);
    console.log("Recruiter access token:", recruiterAccessToken);
    console.log("Admin access token:", adminAccessToken);
    
    if (userAccessToken || recruiterAccessToken || adminAccessToken) {
      return true; 
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
