import { createAction, props } from '@ngrx/store';
import { IProfessionalDetails, IUser } from './user.state';

export const loginUser = createAction(
  '[User] Login',
  props<{ credentials: { email: string; password: string } }>()
);

export const loginUserSuccess = createAction(
  '[User] Login Success',
  props<{ user: IUser; accessToken: string, role:string}>()
);

export const loginUserFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);

export const logoutUser = createAction('[User] Logout');

export const resetJustLoggedIn = createAction('[User] Reset Just Logged In');

export const recruiterInitializeApp = createAction('[App] Initialize');

export const loadProfessionalDetails = createAction('[User] Load Professional Details');

export const loadProfessionalDetailsSuccess = createAction(
  '[User] Load Professional Details Success',
  props<{ professionalDetails: IProfessionalDetails }>()
);
export const loadProfessionalDetailsFailure = createAction(
  '[User] Load Professional Details Failure',
  props<{ error: string }>()
);

export const updateProfessionalDetails = createAction(
  '[User] Update Professional Details',
  props<{ professionalDetails: IProfessionalDetails }>()
);
export const updateProfessionalDetailsSuccess = createAction(
  '[User] Update Professional Details Success',
  props<{ professionalDetails: IProfessionalDetails }>()
);
export const updateProfessionalDetailsFailure = createAction(
  '[User] Update Professional Details Failure',
  props<{ error: string }>()
);
