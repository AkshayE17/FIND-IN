import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { LoginResponse, IUser, IProfessionalDetails } from '../state/user/user.state';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.storeUserData(response.user);
        this.storeTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
  }

  private storeUserData(user: IUser) {
    this.cookieService.set('user', JSON.stringify(user), { path: '/' });
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set('accessToken', accessToken, { path: '/' });
    this.cookieService.set('refreshToken', refreshToken, { path: '/' });
  }

  getUserData(): IUser | null {
    const userData = this.cookieService.get('user');
    return userData ? JSON.parse(userData) : null;
  }

  getUserId(): string | null {
    const user = this.getUserData();
    return user ? user.id : null;
  }


  clearUserData() {
    this.cookieService.delete('user', '/');
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
  }

  getProfessionalDetails() {
    const userId=this.getUserId()
    return this.http.get<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`);
  }
  
  updateProfessionalDetails(professionalDetails: IProfessionalDetails) {
    const userId=this.getUserId()
    return this.http.put<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`, professionalDetails);
  }
  

  isTokenExpired(token: string): boolean {  
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
}

refreshToken(refreshToken: string) {
    return this.http.post<LoginResponse>('/auth/refresh-token', { refreshToken });
}
}
