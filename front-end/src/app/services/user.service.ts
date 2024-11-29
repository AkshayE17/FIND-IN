import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginResponse, IUser, IProfessionalDetails } from '../state/user/user.state';
import { AuthService } from './auth.service';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient, private authService:AuthService) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/user/login`, credentials).pipe(
      map((response: LoginResponse) => {
        this.authService.storeUserData(response.user);
        this.authService.storeUserTokens(response.accessToken, response.refreshToken);
        return response;
      })
    );
  }

  

  getProfessionalDetails() {
    const userId=this.authService.getUserId();
    console.log("user id",userId);  
    return this.http.get<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`);
  }
  
  updateProfessionalDetails(professionalDetails: IProfessionalDetails) {
    const userId=this.authService.getUserId()
    console.log("professional details",professionalDetails)
    return this.http.put<IProfessionalDetails>(`${this.apiUrl}/user/professional-details/${userId}`, professionalDetails);
  }
  
  createProfessionalDetails(professionalDetails: IProfessionalDetails) {
    return this.http.post<IProfessionalDetails>(`${this.apiUrl}/user/professional-details`, professionalDetails);
  }

}
