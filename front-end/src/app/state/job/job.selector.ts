import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobState } from './job.state';

export const selectJobState = createFeatureSelector<JobState>('job');

export const selectJobs = createSelector(
  selectJobState,
  (state: JobState) => state.jobs 
);


export const selectAllJobs = createSelector(
  selectJobState,
  (state: JobState) => state.jobs // You can also modify this to filter if needed
);


