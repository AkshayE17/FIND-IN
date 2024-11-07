import { createAction, props } from '@ngrx/store';
import { ICompany, IRecruiter } from './recruiter.state';

export const loginRecruiter = createAction(
  '[Recruiter] Login Recruiter',
  props<{ credentials: { email: string, password: string } }>()
);

export const loginRecruiterSuccess = createAction(
  '[Recruiter] Login Recruiter Success',
  props<{ recruiter: IRecruiter; accessToken: string; refreshToken: string; companyDetails?: ICompany }>()
);


export const loginRecruiterFailure = createAction(
  '[Recruiter] Login Recruiter Failure',
  props<{ error: string }>()
);

export const logoutRecruiter = createAction('[Recruiter] Logout');

export const loadCompanyDetails = createAction(
  '[Recruiter] Load Company Details',
  props<{ accessToken: string; recruiterId: string }>()
);

export const addOrUpdateCompanyDetails = createAction(
  '[Recruiter] Add or Update Company Details',
  props<{ companyDetails: ICompany; accessToken: string; recruiterId: string }>()
);

export const addOrUpdateCompanyDetailsSuccess = createAction(
  '[Recruiter] Add or Update Company Details Success',
  props<{ companyDetails: ICompany }>()
);

export const addOrUpdateCompanyDetailsFailure = createAction(
  '[Recruiter] Add or Update Company Details Failure',
  props<{ error: string }>()
);

export const setCompanyDetails = createAction(
  '[Recruiter] Set Company Details',
  props<{ companyDetails: ICompany }>()
);


export const userInitializeApp = createAction('[App] Initialize');
