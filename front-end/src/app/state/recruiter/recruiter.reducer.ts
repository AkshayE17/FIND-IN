import { createReducer, on } from '@ngrx/store';
import { loginRecruiter, loginRecruiterSuccess, loginRecruiterFailure } from './recruiter.action';
import { RecruiterState, initialRecruiterState } from './recruiter.state';

export const recruiterReducer = createReducer(
  initialRecruiterState,

  on(loginRecruiter, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loginRecruiterSuccess, (state, { recruiter }) => ({
    ...state,
    recruiter,
    loading: false,
    error: null
  })),

  on(loginRecruiterFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
