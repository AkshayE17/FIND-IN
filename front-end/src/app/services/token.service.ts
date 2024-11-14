import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private apiUrl = 'http://localhost:8888';
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  refreshToken(): Observable<any> {
    const refreshToken = this.cookieService.get('userRefreshToken') || 
                         this.cookieService.get('recruiterRefreshToken') || 
                         this.cookieService.get('adminRefreshToken');
                         
    return this.http.post(`${this.apiUrl}/user/refresh-token`, { refreshToken });
  }
}
