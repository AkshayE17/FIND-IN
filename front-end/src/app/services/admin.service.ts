import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { IRecruiter } from '../state/recruiter/recruiter.state';
import { IJobCategory } from '../state/job/job.state';
import { IUser } from '../state/user/user.state';
import { LoginResponse } from '../state/admin/admin.state';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient,private  authService:AuthService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/admin/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.authService.storeAdminData(response.admin);
        this.authService.storeAdminTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
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
  isBlocked?:boolean | null,
  email?: string
): Observable<{ users: IUser[], total: number }> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('pageSize', pageSize.toString());

  if (search) params = params.set('search', search);
  if(gender) params = params.set('gender',gender)
  if (startDate) params = params.set('startDate', startDate);
  if (endDate) params = params.set('endDate', endDate);
  if (email) params = params.set('email', email);
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

  deleteJobCategory(id: string |undefined | null): Observable<void> {
    console.log("entering the delete category service")
    return this.http.delete<void>(`${this.apiUrl}/admin/job-category/${id}`);
  }
  
 



  getUploadUrl(fileName: string, fileType: string): Observable<{ url: string }> {
    console.log('Getting upload URL for:', { fileName, fileType });
    return this.http.post<{ url: string }>(
      `${this.apiUrl}/admin/generate-upload-url`, 
      { fileName, fileType }
    ).pipe(
      tap(response => console.log('Got presigned URL:', response)),
      catchError(error => {
        console.error('Error getting upload URL:', {
          status: error.status,
          message: error.message,
          error: error
        });
        throw error;
      })
    );
  }
  
  uploadFileToS3(url: string, file: File): Promise<void> {
    console.log('Uploading file with:', {
      url,
      fileType: file.type,
      fileSize: file.size,
      fileName: file.name
    });
  
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })
    .then(async response => {
      if (!response.ok) {
        // Log more error details
        const errorText = await response.text();
        const headersMap = new Map();
        response.headers.forEach((value, name) => {
          headersMap.set(name, value);
        });
        console.error('Upload failed with:', {
          status: response.status,
          statusText: response.statusText,
          responseBody: errorText,
          headers: Object.fromEntries(headersMap)
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      return;
    })
    .catch(error => {
      console.error('Error during file upload:', error);
      throw error;
    });
  }
  

}
