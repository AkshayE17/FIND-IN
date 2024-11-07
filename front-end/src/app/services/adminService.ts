import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { IAdmin } from '../state/admin/admin.state';
import { IJobCategory } from '../state/job/job.state';
import { IUser } from '../state/user/user.state';
import { CookieService } from 'ngx-cookie-service';
import { LoginResponse } from '../state/admin/admin.state';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.storeAdminData(response.admin);
        this.storeTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
  }

  private storeAdminData(admin: IAdmin) {
    this.cookieService.set('admin', JSON.stringify(admin), { path: '/' });
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.cookieService.set('AdminAccessToken', accessToken, { path: '/' });
    this.cookieService.set('AdminRefreshToken', refreshToken, { path: '/' });
  }

  getPendingRecruiters(
    page: number,
    pageSize: number,
    search?: string,
    company?: string,
    startDate?: string,
    endDate?: string
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (company) params = params.set('company', company);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<{ recruiters: IRecruiter[], total: number }>(
      `${this.apiUrl}/admin/pending`,
      { params }
    );
  }

  getAllRecruiters(
    page: number, 
    pageSize: number, 
    search?: string, 
    company?: string,
    startDate?: string,
    endDate?: string,
    isBlocked?: boolean | null
): Observable<{ recruiters: IRecruiter[], total: number }> {
    let params = new HttpParams()
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (company) params = params.set('company', company);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    
    if (isBlocked !== null && isBlocked !== undefined) {
        params = params.set('isBlocked', isBlocked.toString());
    }

    console.log('params:', params); 

    return this.http.get<{ recruiters: IRecruiter[], total: number }>(
        `${this.apiUrl}/admin/recruiters`,
        { params }
    );
}

getAllUsers(
  page: number,
  pageSize: number,
  search?: string,
  gender?: string,
  startDate?: string,
  endDate?: string,
  isBlocked?:boolean | null
): Observable<{ users: IUser[], total: number }> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());

  if (search) params = params.set('search', search);
  if(gender) params = params.set('gender',gender)
  if (startDate) params = params.set('startDate', startDate);
  if (endDate) params = params.set('endDate', endDate);
  if (isBlocked !== null && isBlocked !== undefined) {
    params = params.set('isBlocked', isBlocked.toString());
}

  console.log('params:', params); 


  return this.http.get<{ users: IUser[], total: number }>(
    `${this.apiUrl}/admin/users`,
    
    { params }
  ).pipe(
    catchError(error => {
      console.error('Error fetching users:', error);
      return throwError(error);
    })
  );
}




  approveRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-approve`, { email });
  }

  rejectRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-reject`, { email });
  }

  blockOrUnblockRecruiter(email: string): Observable<IRecruiter> {
    return this.http.put<IRecruiter>(`${this.apiUrl}/admin/recruiter-block`, { email });
  }
  blockOrUnblockUser(email: string): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/admin/user-block`, { email });
  }


  blockUser(email: string): Observable<IUser> {
    return this.http.put<IUser>(`${this.apiUrl}/admin/user-block`, { email });
  }

  getJobCategories(page: number = 1, limit: number = 10, searchTerm: string = ''): Observable<{ categories: IJobCategory[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
  
    return this.http.get<{ categories: IJobCategory[], total: number }>(`${this.apiUrl}/admin/job-categories`, { params });
  }
  

  createJobCategory(formData: FormData): Observable<IJobCategory> {
    return this.http.post<IJobCategory>(`${this.apiUrl}/admin/job-category`, formData).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
  
  updateJobCategory(id: string, data: FormData): Observable<IJobCategory> {
    console.log("entering the update category service")
    return this.http.put<IJobCategory>(`${this.apiUrl}/admin/job-category/${id}`, data);
  }

  deleteJobCategory(id: string | null): Observable<void> {
    console.log("entering the delete category service")
    return this.http.delete<void>(`${this.apiUrl}/admin/job-category/${id}`);
  }
  

  clearAdminData() {
    this.cookieService.delete('admin', '/');
    this.cookieService.delete('AdminAccessToken', '/');
    this.cookieService.delete('AdminRefreshToken', '/');
  }
}
