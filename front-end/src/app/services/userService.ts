
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../state/user/user.state';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<IUser> {
    return this.http.post<IUser>(`${this.apiUrl}/user/login`, credentials).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

}
