import { Routes } from '@angular/router';
import { HomeComponent } from './components/common/home/home.component';
import { UserRegisterComponent } from './components/user/user-register/user-register.component';
import { RecruiterRegisterComponent } from './components/recruiter/recruiter-register/recruiter-register.component';
import { VerifiedsuccessComponent } from './components/user/verifiedsuccess/verifiedsuccess.component';
import { ForgotpasswordComponent } from './components/common/forgotpassword/forgotpassword.component';
import { AdminlayoutComponent } from './components/admin/adminlayout/adminlayout.component';
import { MainContentComponent } from './components/admin/main-content/main-content.component';
import { UsersComponent } from './components/admin/users/users.component';
import { RecruitersComponent } from './components/admin/recruiters/recruiters.component';
import { VerifyRecruitersComponent } from './components/admin/verified-recruiters/verified-recruiters.component';
import { VerifySuccessComponent } from './components/recruiter/verify-success/verify-success.component';
import { JobCategoryComponent } from './components/admin/job-category/job-category.component';
import { UserDashboardComponent } from './components/user/user-dashboard/user-dashboard.component';
import { RecruiterDashboardComponent } from './components/recruiter/recruiter-dashboard/recruiter-dashboard.component';
import { UserDetailsComponent } from './components/user/user-details/user-details.component';
import { RecruiterDetailsComponent } from './components/recruiter/recruiter-details/recruiter-details.component';
import { CompanyDetailsComponent } from './components/recruiter/company-details/company-details.component';
import { PostJobComponent } from './components/recruiter/post-job/post-job.component';
import { ManageJobsComponent } from './components/recruiter/manage-jobs/manage-jobs.component';
import { JobComponent } from './components/user/jobs/jobs.component';
import { JobsDetailsComponent } from './components/user/jobs-details/jobs-details.component';
import { AppliedJobsComponent } from './components/user/applied-jobs/applied-jobs.component';
import { ProfessionalDetailsComponent } from './components/user/professional-details/professional-details.component';
import { JobsComponent } from './components/admin/jobs/jobs.component';
import { ShortListedComponent } from './components/recruiter/short-listed/short-listed.component';
import { AuthGuard } from './services/auth-guard.service';
import { UnauthorizedComponent } from './components/common/unauthorized/unauthorized.component';
import { UserChatComponent } from './components/user/user-chat/user-chat.component';
import { RecruiterChatComponent } from './components/recruiter/recruiter-chat/recruiter-chat.component';
import { UserLoginComponent } from './components/user/user-login/user-login.component';
import { RecruiterLoginComponent } from './components/recruiter/recruiter-login/recruiter-login.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { ShortListComponent } from './components/user/short-list/short-list.component';
import { AdminAuthGuard } from './services/admin-auth-gaurd.service';
import { ChangePasswordComponent } from './components/recruiter/change-password/change-password.component';
import { JobReportComponent } from './components/admin/job-report/job-report.component';
import { RoomIdComponent } from './components/recruiter/room-id/room-id.component';
import { VideoCallComponent } from './components/recruiter/video-call/video-call.component';
import { UserChangePasswordComponent } from './components/user/user-change-password/user-change-password.component';
import { RoomComponent } from './components/user/room/room.component';
import { VideoComponent } from './components/user/video/video.component';

export const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'user/login',component:UserLoginComponent},
  {path:'user/register',component:UserRegisterComponent},
  {path:'recruiter/login',component:RecruiterLoginComponent},
  {path:'recruiter/register',component:RecruiterRegisterComponent},
  { path: 'user/verify-success', component:VerifiedsuccessComponent },
  {path:'recruiter/verify-success',component:VerifySuccessComponent},
  {path:'forgot-password',component:ForgotpasswordComponent},
  {path:'user/jobs',component:JobComponent},
  {path:'user/job-details/:id',component:JobsDetailsComponent},
  {path:'admin/login',component:AdminLoginComponent},
  {path:'unauthorized',component:UnauthorizedComponent},
  {path:'recruiter/room/:roomId',canActivate:[AuthGuard],component:RoomIdComponent},
  {path:'user/room/:roomId',canActivate:[AuthGuard],component:RoomComponent},

  {
    path: 'admin',
    component:AdminlayoutComponent, 
    canActivate:[AdminAuthGuard],
    children: [
      {path:'',component:MainContentComponent},
      { path: 'dashboard', component:MainContentComponent},
      {path: 'verified-recruiters',component:VerifyRecruitersComponent},
      { path: 'users', component:UsersComponent },
      { path: 'recruiters', component:RecruitersComponent},
      {path:'jobcategory',component:JobCategoryComponent},
      {path:'jobs',component:JobsComponent},
      {path:'report',component:JobReportComponent},
 
    ],
  },
  {
    path:'user/dashboard',component:UserDashboardComponent,
    canActivate:[AuthGuard],
    children:[
      {path:"user-details",component:UserDetailsComponent},
      {path:"applied-jobs",component:AppliedJobsComponent},
      {path:"professional-details",component:ProfessionalDetailsComponent},
      {path:"chat",component:UserChatComponent},
      {path:"short-list",component:ShortListComponent},
      {path:"change-password",component:UserChangePasswordComponent},
      {path:'video-call',component:VideoComponent},
    
    ]
  },
  {
    path:'recruiter/dashboard',component:RecruiterDashboardComponent,
    canActivate:[AuthGuard],
    children:[
      {path:'recruiter-details',component:RecruiterDetailsComponent},
      {path:"company-details",component:CompanyDetailsComponent},
      {path:"post-job",component:PostJobComponent},
      {path:"manage-jobs",component:ManageJobsComponent},
      {path:"shortlisted",component:ShortListedComponent},
      {path:"chat",component:RecruiterChatComponent},
      {path:"change-password",component:ChangePasswordComponent},
      {path:"video-call",component:VideoCallComponent},
    ]
  }
]