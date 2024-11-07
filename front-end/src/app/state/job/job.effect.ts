import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { JobService } from '../../services/jobService';
import { createJob, loadJobs, loadJobsSuccess, loadJobFailure, updateJob, deleteJob, loadAllJobs, loadAllJobsSuccess } from './job.action';

@Injectable()
export class JobEffects {
  constructor(private actions$: Actions, private jobService: JobService) {}



  createJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createJob),
      mergeMap(({ job }) => {
        return this.jobService.createJob(job).pipe(
          map(() => loadJobsSuccess({ jobs: [job] })),
          catchError(error => of(loadJobFailure({ error: error.message })))
        );
      })
    )
  );

  loadAllJobs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAllJobs),
      mergeMap(() =>
        this.jobService.getAllJobs(1, 10).pipe( 
          map(response => loadAllJobsSuccess({ jobs: response.jobs, total: response.total })),
          catchError(error => of(loadJobFailure({ error: error.message })))
        )
      )
    )
  );
  
  

  deleteJob$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteJob),
      mergeMap(({ jobId }) =>
        this.jobService.deleteJob(jobId).pipe(
          map(() => loadJobs()), 
          catchError(error => of(loadJobFailure({ error: error.message })))
        )
      )
    )
  );
}
