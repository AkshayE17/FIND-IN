import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginResponse, IUser, IProfessionalDetails } from '../state/user/user.state';
import { AuthService } from './auth.service';
import { catchError, map, throwError } from 'rxjs';
import { IJobCategory } from '../state/job/job.state';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.backendUrl;

  constructor(private http: HttpClient, private authService:AuthService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe(
      map((response: LoginResponse) => {
        console.log("user is: ", response.user);  
        this.authService.storeUserData(response.user);
        this.authService.storeUserTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
  }

  getUserById(userId: string| null) {
    return this.http.get<IUser>(`${this.apiUrl}/user/${userId}`);
  }


  getJobCategories() {
    const result =this.http.get<IJobCategory[]>(`${this.apiUrl}/user/jobCategories`);
    return result;
  }

  
  register(userData: { email: string; password: string }) {
    return this.http.post(`${this.apiUrl}/user/register`, userData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  updateUserProfile(userData: Partial<IUser>) {
    console.log("user update is calling")
    return this.http.put(`${this.apiUrl}/user/profile`, userData).pipe(
      map(updatedUser => {
        return {
          ...userData, 
          ...updatedUser, 
        };
      })
    );
  }
  
  

  getProfessionalDetails() {
    const userId=this.authService.getUserId();
    console.log("user id",userId);  
    console.log("entering professional details")
    return this.http.get<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`);
  }
  
  updateProfessionalDetails(professionalDetails: IProfessionalDetails) {
    const userId=this.authService.getUserId()
    console.log("professional details",professionalDetails)
    return this.http.put<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`, professionalDetails);
  }
  
  createProfessionalDetails(professionalDetails: IProfessionalDetails) {
    const userId=this.authService.getUserId()
    return this.http.post<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`, professionalDetails);
  }


  changePassword(data: { currentPassword: string; newPassword: string; userId: string; }) {
    return this.http
      .patch(`${this.apiUrl}/user/change-password/${data.userId}`, {
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
