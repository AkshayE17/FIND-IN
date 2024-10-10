
import { UserState } from './user/user.state';
import { RecruiterState } from './recruiter/recruiter.state';
import { AdminState } from './admin/admin.state';

export interface AppState {
  user: UserState;
  recruiter:RecruiterState;
  admin:AdminState;

}
