import { IJob } from '../../models/job';
import mongoose, {ObjectId, Types} from 'mongoose';
import { IUser } from '../../models/User';

export interface IJobRepository {
  createJob(jobData: IJob): Promise<IJob>;
  getAllJobs(page: number,pageSize: number,search?: string,jobType?: string,category?: string,startSalary?: string,endSalary?:string,location?: string): Promise<{ jobs: IJob[], total: number }>;
  getRecruiterJobs(
    recruiterId: ObjectId,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }>;
  getRecruiterShortListedJobs(
    recruiterId: ObjectId,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }>;
  getJobById(id: string): Promise<IJob | null>;
  updateJob(id: string, jobData: Partial<IJob>): Promise<IJob | null>;
  deleteJob(id: string): Promise<IJob | null>;
  applyForJob(jobId: string, userId: string):Promise<{ job: IJob | null, user: IUser | null }>;
  findJobsByIds(jobIds:Types.ObjectId[]): Promise<IJob[]> ;
  getApplicantsByJob(recruiterId: mongoose.Types.ObjectId): Promise<IJob[]> 
}
  