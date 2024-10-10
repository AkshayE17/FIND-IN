// user.action.ts
import { createAction, props } from '@ngrx/store';
import { IUser } from './user.state';

export const loginUser = createAction(
  '[User] Login',
  props<{ credentials: { email: string; password: string } }>()
);

export const loginUserSuccess = createAction(
  '[User] Login Success',
  props<{ user: IUser }>() // Pass the user on success
);

export const loginUserFailure = createAction(
  '[User] Login Failure',
  props<{ error: string }>()
);


export const resetJustLoggedIn = createAction('[User] Reset Just Logged In');