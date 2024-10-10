
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { IAdmin } from '../state/admin/admin.state';
import { IUser } from '../state/user/user.state';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<IAdmin> {
    return this.http.post<IAdmin>(`${this.apiUrl}/admin/login`, credentials).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getPendingRecruiters(): Observable<IRecruiter[]> {
    return this.http.get<IRecruiter[]>(`${this.apiUrl}/admin/pending`);
  }

  getAllRecruiters(): Observable<IRecruiter[]> {
    return this.http.get<IRecruiter[]>(`${this.apiUrl}/admin/recruiters`);
  }

  approveRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-approve`, { email });
  }

  rejectRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-reject`, { email });
  }

  blockRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-block`, { email });
  }

  getAllUsers():Observable<IUser[]>{
    return this.http.get<IUser[]>(`${this.apiUrl}/admin/users`)
  }

  blockUser(email:string):Observable<IUser>{
    return this.http.put<IUser>(`${this.apiUrl}/admin/user-block`,{email})
  }
}
