
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    const adminAccessToken = this.cookieService.get('AdminAccessToken');

    console.log("Admin access token:", adminAccessToken);
    
    if (adminAccessToken) {
      return true; 
    } else {
      this.router.navigate(['/admin/login']);
      return false;
    }
  }
}
