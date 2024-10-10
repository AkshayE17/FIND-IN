
import { createReducer, on } from '@ngrx/store';
import { loginAdmin, loginAdminSuccess, loginAdminFailure } from './admin.action';
import { AdminState, initialAdminState } from './admin.state';

export const adminReducer = createReducer(
  initialAdminState,
  on(loginAdmin, (state) => ({ ...state, loading: true })),
  on(loginAdminSuccess, (state, { admin }) => ({
    ...state,
    admin,
    loading: false,
    error: null,
  })),
  on(loginAdminFailure, (state, { error }) => ({
    ...state,
    admin: null,
    loading: false,
    error,
  }))
);
