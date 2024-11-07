import { createReducer, on } from '@ngrx/store';
import { createJob, loadJobsSuccess, loadAllJobsSuccess, updateJob } from '../job/job.action';
import { JobState } from '../job/job.state';

const initialState: JobState = {
  jobs: [],
  total:0
};

export const jobReducer = createReducer(
  initialState,
  on(loadJobsSuccess, (state, { jobs }) => ({ ...state, jobs })),
  on(loadAllJobsSuccess, (state, { jobs, total }) => ({ ...state, jobs, total })),
  on(createJob, (state, { job }) => ({ ...state, jobs: [...state.jobs, job] })),
  on(updateJob, (state, { job }) => ({
    ...state,
    jobs: state.jobs.map(existingJob => (existingJob._id === job._id ? job : existingJob)),
  }))
);

