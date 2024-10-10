import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { IUser } from '../state/user/user.state';
import { IAdmin } from '../state/admin/admin.state';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  apiUrl = 'http://localhost:8888';

  loginUser(credentials: { email: string; password: string }): Observable<IUser> {
    return this.http.post<IUser>(`${this.apiUrl}/user/login`, credentials).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }

  loginRecruiter(credentials: { email: string; password: string }): Observable<IRecruiter> {
    return this.http.post<IRecruiter>(`${this.apiUrl}/recruiter/login`, credentials).pipe(
      catchError((error) => {
        let errorMessage = 'An unknown error occurred';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;  
        } else if (error.status === 400) {
          errorMessage = 'Bad Request';
        }
    
        return throwError(() => new Error(errorMessage)); 
      })
    );
  }

  loginAdmin(credentials: { email: string; password: string }): Observable<IAdmin> {
    return this.http.post<IAdmin>(`${this.apiUrl}/admin/login`, credentials).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }


  getPendingRecruiters(): Observable<IRecruiter[]> {
    return this.http.get<IRecruiter[]>(`${this.apiUrl}/admin/pending`);
  }

  getRecruiters(): Observable<IRecruiter[]> {
    return this.http.get<IRecruiter[]>(`${this.apiUrl}/admin/recruiters`);
  }


approveRecruiter(email: string): Observable<IRecruiter> {
  return this.http.put<IRecruiter>(`${this.apiUrl}/admin/approve`, { email });
}

rejectRecruiter(email: string): Observable<IRecruiter> {
  return this.http.put<IRecruiter>(`${this.apiUrl}/admin/reject`, { email });
}

blockRecruiter(email: string): Observable<IRecruiter> {
  return this.http.put<IRecruiter>(`${this.apiUrl}/admin/block`, { email });
}

}

