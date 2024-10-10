import { createSelector, createFeatureSelector } from '@ngrx/store';
import { RecruiterState } from './recruiter.state';

export const selectRecruiterFeature = createFeatureSelector<RecruiterState>('recruiter');

export const selectRecruiter = createSelector(
  selectRecruiterFeature,
  (state: RecruiterState) => state.recruiter
);

export const selectRecruiterLoading = createSelector(
  selectRecruiterFeature,
  (state: RecruiterState) => state.loading
);

export const selectRecruiterError = createSelector(
  selectRecruiterFeature,
  (state: RecruiterState) => state.error
);
