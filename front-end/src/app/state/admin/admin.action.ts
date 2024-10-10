
import { createAction, props } from '@ngrx/store';
import { IAdmin } from './admin.state';

export const loginAdmin = createAction(
  '[Admin] Login',
  props<{ credentials: { email: string; password: string } }>()
);

export const loginAdminSuccess = createAction(
  '[Admin] Login Success',
  props<{ admin: IAdmin }>()
);

export const loginAdminFailure = createAction(
  '[Admin] Login Failure',
  props<{ error: string }>()
);
