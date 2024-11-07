// job.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { IJob, IJobCategory, IJobResponse } from '../state/job/job.state'; 
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  getJobDetails(jobId: string): Observable<IJobResponse> {
    const details$ = this.http.get<IJobResponse>(`${this.apiUrl}/user/job/${jobId}`);
  
    details$.subscribe(
      (details) => {
        console.log("Job details:", details);
      },
      (error) => {
        console.error("Error fetching job details:", error);
      }
    );
  
    return details$;
  }
  
  

  // Create a new job
  createJob(job: IJob): Observable<IJob> {
    return this.http.post<IJob>(`${this.apiUrl}/recruiter/post-job`, job);
  }

  // Update an existing job
  updateJob(jobId: number, job: IJob): Observable<IJob> {
    console.log("Updating job:", job);
    return this.http.put<IJob>(`${this.apiUrl}/recruiter/job/${jobId}`, job); 
  }
  

  getAllJobs(
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string,
    category?: string,
    startSalary?: string,
    endSalary?: string,
    location?: string
  ): Observable<{ jobs: IJob[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (jobType) params = params.set('jobType', jobType);
    if (category) params = params.set('category', category);
    if (startSalary) params = params.set('startSalary', startSalary);
    if (endSalary) params = params.set('endSalary', endSalary);
    if (location) params = params.set('location', location);

    console.log("params from front-end:",params.toString())

    return this.http.get<{ jobs: IJob[], total: number }>(
      `${this.apiUrl}/user/jobs`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error fetching jobs:', error);
        return throwError(error);
      })
    );
  }

  applyForJob(jobId: string, userId: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/job/${jobId}/apply`, { userId }).pipe(
      catchError(error => {
        console.error('Error applying for job:', error);
        return throwError(error);
      })
    );
  }
  

  // Fetch recruiter jobs
  getRecruiterJobs(
    recruiterId:string | null,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string,
  ): Observable<{ jobs: IJob[], total: number }> {
    let recruiterParam = recruiterId ? recruiterId.toString() : '';
    let params = new HttpParams()
      .set('recruiterId',recruiterParam)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (jobType) params = params.set('jobType', jobType);

    console.log("params from front-end:", params.toString());

    return this.http.get<{ jobs: IJob[], total: number }>(
      `${this.apiUrl}/recruiter/jobs`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error fetching recruiter jobs:', error);
        return throwError(error);
      })
    );
  }
  

  // delete a job
  deleteJob(jobId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recruiter/job/${jobId}`);
  }


  //getJocCategories
  getJobCategories():Observable<IJobCategory[]>{
    console.log("entering the get all job categories");
    return this.http.get<IJobCategory[]>(`${this.apiUrl}/recruiter/jobCategories`);
  }


  //getAppliedJobs
  getAppliedJobs(userId: string | null): Observable<IJobResponse[]> {
    return this.http.get<IJobResponse[]>(`${this.apiUrl}/user/applied/${userId}`);
  }

  // job.service.ts
getJobApplicants(jobId: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/user/job/${jobId}/applicants`);
}

}
