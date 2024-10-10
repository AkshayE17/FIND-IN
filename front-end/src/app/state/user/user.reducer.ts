import { Action, createReducer, on } from '@ngrx/store';
import { initialUserState, UserState } from './user.state';
import * as UserActions from './user.action'

export const userReducer = createReducer(
  initialUserState,
  on(UserActions.loginUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loginUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(UserActions.loginUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export function reducer(state: UserState | undefined, action: Action) {
  return userReducer(state, action);
}
