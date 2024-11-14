import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './user.state';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUser = createSelector(
  selectUserState,
  (state: UserState) => state.user
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state: UserState) => state.error
);

export const selectProfessionalDetails = createSelector(
  selectUserState,
  (state: UserState) => state.professionalDetails
);

export const selectProfessionalDetailsLoading = createSelector(
  selectUserState,
  (state: UserState) => state.loading
);

export const selectUserAccessToken=createSelector(
  selectUserState,
  (state:UserState)=>state.accessToken
)

export const selectUserRole=createSelector(
  selectUserState,
  (state:UserState)=>state.role
)