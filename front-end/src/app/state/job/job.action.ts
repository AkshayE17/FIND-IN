import { createAction, props } from '@ngrx/store';
import { IJob } from './job.state';

export const loadJobs = createAction('[Job] Load Jobs'); 
export const loadAllJobs = createAction('[Job] Load All Jobs');
export const createJob = createAction('[Job] Create Job', props<{ job: IJob }>());
export const loadJobsSuccess = createAction('[Job] Load Jobs Success', props<{ jobs: IJob[] }>());
export const loadAllJobsSuccess = createAction('[Job] Load All Jobs Success', props<{ jobs: IJob[],total:number }>());
export const loadJobFailure = createAction('[Job] Load Job Failure', props<{ error: string }>());
export const updateJob = createAction('[Job] Update Job', props<{ job: IJob }>());
export const deleteJob = createAction('[Job] Delete Job', props<{ jobId: string }>());
