
import { createReducer, on } from '@ngrx/store';
import { loginAdmin, loginAdminSuccess, loginAdminFailure,logoutAdmin, resetAdminState } from './admin.action';
import { AdminState, initialAdminState } from './admin.state';

export const adminReducer = createReducer(
  initialAdminState,
  on(loginAdmin, (state) => ({ ...state, loading: true })),
  on(loginAdminSuccess, (state, { admin,accessToken }) => ({
    ...state,
    admin,
    accessToken,
    role:'admin',
    loading: false,
    error: null,
  })),
  on(loginAdminFailure, (state, { error }) => ({
    ...state,
    admin: null,
    role: null,
    loading: false,
    error,
  })),
  on(logoutAdmin, () => initialAdminState),
  on(resetAdminState, () => initialAdminState)
);
