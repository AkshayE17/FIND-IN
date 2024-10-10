import { Routes } from '@angular/router';
import { HomeComponent } from './components/common/home/home.component';
import { UserLoginComponent } from './components/user/user-login/user-login.component';
import { UserRegisterComponent } from './components/user/user-register/user-register.component';
import { RecruiterLoginComponent } from './components/recruiter/recruiter-login/recruiter-login.component';
import { RecruiterRegisterComponent } from './components/recruiter/recruiter-register/recruiter-register.component';
import { VerifiedsuccessComponent } from './components/user/verifiedsuccess/verifiedsuccess.component';
import { ForgotpasswordComponent } from './components/common/forgotpassword/forgotpassword.component';
import { LoginComponent } from './components/admin/login/login.component';
import { AdminlayoutComponent } from './components/admin/adminlayout/adminlayout.component';
import { MainContentComponent } from './components/admin/main-content/main-content.component';
import { UsersComponent } from './components/admin/users/users.component';
import { RecruitersComponent } from './components/admin/recruiters/recruiters.component';
import { VerifyRecruitersComponent } from './components/admin/verified-recruiters/verified-recruiters.component';
import { VerifySuccessComponent } from './components/recruiter/verify-success/verify-success.component';

export const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'user/login',component:UserLoginComponent},
  {path:'user/register',component:UserRegisterComponent},
  {path:'recruiter/login',component:RecruiterLoginComponent},
  {path:'recruiter/register',component:RecruiterRegisterComponent},
  { path: 'user/verify-success', component:VerifiedsuccessComponent },
  {path:'recruiter/verify-success',component:VerifySuccessComponent},
  {path:'forgot-password',component:ForgotpasswordComponent},
  {path:'admin/login',component:LoginComponent},
  {
    path: 'admin',
    component:AdminlayoutComponent, 
    children: [
      { path: 'dashboard', component:MainContentComponent},
      {path: 'verified-recruiters',component:VerifyRecruitersComponent},
      { path: 'users', component:UsersComponent },
      { path: 'recruiters', component:RecruitersComponent},
    ],
  }
];
