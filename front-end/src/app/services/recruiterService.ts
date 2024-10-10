
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecruiterService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<IRecruiter> {
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

}
