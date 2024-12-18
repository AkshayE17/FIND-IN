import { IAdmin } from '../../models/admin';
import { IRecruiter } from '../../models/Recruiter';
import { IUser } from '../../models/User';
import { FilterOptions } from '../../models/Recruiter';
import { IJob, JobReportData, JobStatistics } from '../../models/job';

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin>;
  findRecruiters(offset: number, limit: number, search: string, filters: FilterOptions): Promise<{recruiters:IRecruiter[], total: number}>;
  findPendingRecruiters(offset: number, limit: number, search: string, filters: FilterOptions): Promise<{ recruiters: IRecruiter[], total: number }>;
  findUsers(offset: number, limit: number, search: string, email: string, filters: FilterOptions): Promise<{users:IUser[],total:number}>;
  updateRecruiterStatus(email: string, status: 'approved' | 'rejected'): Promise<IRecruiter | null>;
  blockOrUnblockRecruiter(email: string): Promise<IRecruiter | null>;
  blockOrUnblockUser(email: string): Promise<IUser | null>;
  getDashboardStatistics(): Promise<JobStatistics> ;
  getRecentJobs(limit:number | null): Promise<IJob[]>;
  generateJobReport(category?: string): Promise<JobReportData[]>
}