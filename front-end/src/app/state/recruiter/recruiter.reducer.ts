import { Action, createReducer, on } from '@ngrx/store';
import {
  loginRecruiter,
  loginRecruiterSuccess,
  loginRecruiterFailure,
  logoutRecruiter,
  loadCompanyDetails,
  addOrUpdateCompanyDetails,
  addOrUpdateCompanyDetailsSuccess,
  addOrUpdateCompanyDetailsFailure,
  setCompanyDetails,
  resetRecruiterState,
  updateRecruiterProfile,
  updateRecruiterProfileSuccess,
  updateRecruiterProfileFailure
} from './recruiter.action';
import { RecruiterState, initialRecruiterState } from './recruiter.state';

export const recruiterReducer = createReducer(
  initialRecruiterState,

  // Login actions
  on(loginRecruiter, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(loginRecruiterSuccess, (state, { recruiter, accessToken}) => {
    console.log('Recruiter logged in:', recruiter);
    return {
      ...state,
      recruiter,
      accessToken,
      role:'recruiter',
      loading: false,
      error: null,
    };
  }),

  on(loginRecruiterFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(logoutRecruiter, () => initialRecruiterState),
  on(loadCompanyDetails, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(updateRecruiterProfile, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(updateRecruiterProfileSuccess, (state, { recruiter }) => ({
    ...state,
    recruiter,
    loading: false,
  })),
  on(updateRecruiterProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(addOrUpdateCompanyDetails, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(addOrUpdateCompanyDetailsSuccess, (state, { companyDetails }) => ({
    ...state,
    companyDetails,
    loading: false,
    error: null,
  })),

  on(addOrUpdateCompanyDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // New action for setting company details
  on(setCompanyDetails, (state, { companyDetails }) => ({
    ...state,
    companyDetails, // Update the companyDetails in the state
    loading: false, // Optionally set loading to false, if applicable
    error: null, // Reset error if needed
  })),

  on(resetRecruiterState,()=>initialRecruiterState),
  
);

export function reducer(state: RecruiterState | undefined, action: Action) {
  return recruiterReducer(state, action);
}
