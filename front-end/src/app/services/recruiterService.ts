import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginResponse, IRecruiter, ICompany } from '../state/recruiter/recruiter.state';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class RecruiterService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/recruiter/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.storeRecruiterData(response.recruiter);
        this.storeTokens(response.accessToken,response.refreshToken); 
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

  // Store recruiter data in cookies
  private storeRecruiterData(recruiter: IRecruiter) {
    this.cookieService.set('recruiter', JSON.stringify(recruiter), { path: '/' });
  }

  // Store access token in cookies
  private storeTokens(accessToken: string,refreshToken:string) {
    this.cookieService.set('recruiterAccessToken', accessToken, { path: '/' });
    this.cookieService.set('recruiterRefreshToken', refreshToken, { path: '/' });

  }

  getRecruiterData(): IRecruiter | null {
    const recruiterData = this.cookieService.get('recruiter');
    console.log("recruiter data:",recruiterData);
    return recruiterData ? JSON.parse(recruiterData) : null;
  }


  clearRecruiterData() {
    this.cookieService.delete('recruiter', '/');
    this.cookieService.delete('recruiterAccessToken', '/');
    this.cookieService.delete('recruiterRefreshToken','/')
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
      const accessToken = this.getAccessToken();
      const recruiterId = this.getRecruiterId();
  
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

  getAccessToken(): string | null {
    return this.cookieService.get('recruiterAccessToken');
  }

  getRecruiterId(): string | null {
    const recruiter = this.getRecruiterData();
    return recruiter ? recruiter._id : null;
  }


}
