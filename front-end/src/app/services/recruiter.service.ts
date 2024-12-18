import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginResponse, IRecruiter, ICompany } from '../state/recruiter/recruiter.state';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecruiterService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient, private authService: AuthService ) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/recruiter/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.authService.storeRecruiterData(response.recruiter);
        this.authService.storeRecruiterTokens(response.accessToken,response.refreshToken); 
        return response;
      }),
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


  updateRecruiterProfile(recruiterData: Partial<IRecruiter>) {
    return this.http.put(`${this.apiUrl}/recruiter/profile`, recruiterData).pipe(
      map(updatedRecruiter => {
        return {
          ...recruiterData, // Spread the updated fields
          ...updatedRecruiter, // Spread the response to get any server-side modifications
        };
      })
    );
  }

  
  register(userData: { email: string; password: string }) {
    return this.http.post<IRecruiter>(`${this.apiUrl}/recruiter/register`, userData).pipe(
      map((response: IRecruiter) => {
        return response;
      })
    );
  }

  // Fetch company details for the recruiter
  getCompanyDetails(accessToken: string, recruiterId: string): Observable<ICompany> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });
    return this.http.get<ICompany>(`${this.apiUrl}/recruiter/company-details/${recruiterId}`, { headers })
      .pipe(
        catchError((error) => {
          let errorMessage = 'Failed to load company details';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }

    // New method to get company ID
    getCompanyIdForRecruiter(): Observable<string | null> {
      const accessToken = this.authService.getRecruiterAccessToken();
      const recruiterId = this.authService.getRecruiterId();
  
      if (!accessToken || !recruiterId) {
        return of(null); 
      }
  
      return this.getCompanyDetails(accessToken, recruiterId).pipe(
        map(company => company ? company._id : null),
        catchError(() => of(null))
      );
    }

  addOrUpdateCompanyDetails(companyDetails: ICompany, accessToken: string, recruiterId: string): Observable<ICompany> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });

    console.log("entering recruiter service")
    return this.http.post<ICompany>(`${this.apiUrl}/recruiter/company-details/${recruiterId}`, companyDetails, { headers })
      .pipe(
        catchError((error) => {
          let errorMessage = 'Failed to save company details';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }



  changePassword(data: { currentPassword: string; newPassword: string; recruiterId: string; }) {
    return this.http
      .patch(`${this.apiUrl}/recruiter/change-password/${data.recruiterId}`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      .pipe(
        catchError((error) => {
          let errorMessage = 'Failed to change password';
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  
  



}
