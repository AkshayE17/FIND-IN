import { createAction, props } from '@ngrx/store';
import { IRecruiter } from './recruiter.state';

export const loginRecruiter = createAction(
  '[Recruiter] Login Recruiter',
  props<{ credentials: { email: string, password: string } }>()
);

export const loginRecruiterSuccess = createAction(
  '[Recruiter] Login Recruiter Success',
  props<{ recruiter: IRecruiter}>() 
);

export const loginRecruiterFailure = createAction(
  '[Recruiter] Login Recruiter Failure',
  props<{ error: string }>()
);
