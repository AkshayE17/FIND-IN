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
import { JobCandidatesComponent } from './components/recruiter/job-candidates/job-candidates.component';
import { ProfessionalDetailsComponent } from './components/user/professional-details/professional-details.component';
import { AppliedCandidatesComponent } from './components/recruiter/applied-candidates/applied-candidates.component';
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
  {path:'admin/login',component:LoginComponent},

  {
    path: 'admin',
    component:AdminlayoutComponent, 
    children: [
      { path: 'dashboard', component:MainContentComponent},
      {path: 'verified-recruiters',component:VerifyRecruitersComponent},
      { path: 'users', component:UsersComponent },
      { path: 'recruiters', component:RecruitersComponent},
      {path:'jobcategory',component:JobCategoryComponent},
    ],
  },
  {
    path:'user/dashboard',component:UserDashboardComponent,
    children:[
      {path:"user-details",component:UserDetailsComponent},
      {path:"applied-jobs",component:AppliedJobsComponent},
      {path:"professional-details",component:ProfessionalDetailsComponent},
    ]
  },
  {
    path:'recruiter/dashboard',component:RecruiterDashboardComponent,
    children:[
      {path:'recruiter-details',component:RecruiterDetailsComponent},
      {path:"company-details",component:CompanyDetailsComponent},
      {path:"post-job",component:PostJobComponent},
      {path:"manage-jobs",component:ManageJobsComponent},
      {path:"applied-candidates",component:AppliedCandidatesComponent}
    ]
  }
];