import { IJob } from '../../models/job';
import { IUser } from '../../models/User';

export interface IJobService {
  createJob(jobData: IJob): Promise<IJob>;
  getAllJobs(
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string,
    category?: string,
    startSalary?: string,
    endSalary?: string,
    location?: string
  ): Promise<{ jobs: IJob[], total: number }>;
  getRecruiterJobs(
    recruiterId: string,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }>;
  getJobById(id: string): Promise<IJob | null>;
  updateJob(id: string, jobData: Partial<IJob>): Promise<IJob | null>;
  deleteJob(id: string): Promise<IJob | null>;
  applyForJob(jobId: string, userId: string):Promise<{ job: IJob | null, user: IUser | null }>;
  getAppliedJobs(userId: string): Promise<IJob[]>
  getCompanyIdByRecruiterId(recruiterId: string): Promise<string | null>;
  getJobsWithApplicants(recruiterId: string): Promise<IJob[]> ;
}
