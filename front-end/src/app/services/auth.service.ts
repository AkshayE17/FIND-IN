import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { IAdmin } from '../state/admin/admin.state';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { IUser } from '../state/user/user.state';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService, private tokenService: TokenService) { }


  storeAdminData(admin: IAdmin) {
    this.cookieService.set('admin', JSON.stringify(admin), { path: '/' });
  }

  storeAdminTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set('AdminAccessToken', accessToken, { path: '/' });
    this.cookieService.set('AdminRefreshToken', refreshToken, { path: '/' });
  }


  clearAdminData() {
    this.cookieService.delete('admin', '/');
    this.cookieService.delete('AdminAccessToken', '/');
    this.cookieService.delete('AdminRefreshToken', '/');
  }


  storeRecruiterData(recruiter: IRecruiter) {
    this.cookieService.set('recruiter', JSON.stringify(recruiter), { path: '/' });
  }

  // Store access token in cookies
   storeRecruiterTokens(accessToken: string,refreshToken:string) {
    this.cookieService.set('recruiterAccessToken', accessToken, { path: '/' });
    this.cookieService.set('recruiterRefreshToken', refreshToken, { path: '/' });

  }

  getRecruiterData(): IRecruiter | null {
    const recruiterData = this.cookieService.get('recruiter');
    return recruiterData ? JSON.parse(recruiterData) : null;
  }

  getAdminData(): IAdmin | null {
    const adminData = this.cookieService.get('admin');
    return adminData ? JSON.parse(adminData) : null;
  }


  clearRecruiterData() {
    this.cookieService.delete('recruiter', '/');
    this.cookieService.delete('recruiterAccessToken', '/');
    this.cookieService.delete('recruiterRefreshToken','/')
  }

  getRecruiterAccessToken(): string | null {
    return this.cookieService.get('recruiterAccessToken');
  }

  getRecruiterId(): string | null {
    const recruiter = this.getRecruiterData();
    return recruiter ? recruiter._id : null;
  }


  storeUserData(user: IUser) {
    this.cookieService.set('user', JSON.stringify(user), { path: '/' });
  }

  storeUserTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set('accessToken', accessToken, { path: '/' });
    this.cookieService.set('refreshToken', refreshToken, { path: '/' });
  }

  getUserData(): IUser | null {
    const userData = this.cookieService.get('user');
    return userData ? JSON.parse(userData) : null;
  }

  getUserId(): string | null {
    const user = this.getUserData();
    return user ? user._id : null;
  }


  clearUserData() {
    this.cookieService.delete('user', '/');
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
  }
  
  refreshUserToken() {
    this.tokenService.refreshToken().subscribe((response) => {
      const { accessToken, refreshToken } = response;
      if (accessToken) {
        this.cookieService.set('userAccessToken', accessToken, { path: '/' });
        this.cookieService.set('userRefreshToken', refreshToken, { path: '/' });
      }
    });
  }

  refreshRecruiterToken() {
    this.tokenService.refreshToken().subscribe((response) => {
      const { accessToken, refreshToken } = response;
      if (accessToken) {
        this.cookieService.set('recruiterAccessToken', accessToken, { path: '/' });
        this.cookieService.set('recruiterRefreshToken', refreshToken, { path: '/' });
      }
    });
  }

  refreshAdminToken() {
    this.tokenService.refreshToken().subscribe((response) => {
      const { accessToken, refreshToken } = response;
      if (accessToken) {
        this.cookieService.set('adminAccessToken', accessToken, { path: '/' });
        this.cookieService.set('adminRefreshToken', refreshToken, { path: '/' });
      }
    });
  }
}
