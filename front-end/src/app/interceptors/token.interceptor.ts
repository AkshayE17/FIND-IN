import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUserAccessToken } from '../state/user/user.selector';
import { selectAdminAccessToken } from '../state/admin/admin.selector';
import { selectRecruiterAccessToken } from '../state/recruiter/recruiter.selector';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private store:Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userAccessToken = this.store.select(selectUserAccessToken);
    const recruiterAccessToken = this.store.select(selectRecruiterAccessToken);
    const adminAccessToken = this.store.select(selectAdminAccessToken);

    let accessToken = null;

    if (userAccessToken) {
      accessToken = userAccessToken;
    } else if (recruiterAccessToken) {
      accessToken = recruiterAccessToken;
    } else if (adminAccessToken) {
      accessToken = adminAccessToken;
    }


    if (accessToken) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
      return next.handle(cloned);
    } else {
      return next.handle(req); 
    }
  }
}
