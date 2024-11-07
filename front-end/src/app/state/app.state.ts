
import { UserState } from './user/user.state';
import { RecruiterState } from './recruiter/recruiter.state';
import { AdminState } from './admin/admin.state';
import { JobState } from './job/job.state';

export interface AppState {
  user: UserState;
  recruiter:RecruiterState;
  admin:AdminState;
  job:JobState
}
