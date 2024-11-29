import { IJobService } from '../interfaces/job/IJobService';
import { IJobRepository } from '../interfaces/job/IJobRepository';
import { ICompanyRepository } from '../interfaces/company/ICompanyRepository';
import { IJob } from '../models/job';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import { Messages } from '../constants/message.constants';

export class JobService implements IJobService {

  constructor(
    private _jobRepository: IJobRepository,
    private _companyRepository: ICompanyRepository
  ) {}

  // Create a new job
  async createJob(jobData: IJob): Promise<IJob> {
    try {
      const newJob = await this._jobRepository.createJob(jobData);
      console.log(Messages.JOB_CREATED);  
      return newJob;
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);  
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Get company ID by recruiter ID
  async getCompanyIdByRecruiterId(recruiterId: string): Promise<string | null> {
    try {
      const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);
      const company = await this._companyRepository.getByHrId(recruiterObjectId);
      if (!company) {
        console.error(Messages.COMPANY_NOT_FOUND);  
        throw new Error(Messages.COMPANY_NOT_FOUND);
      }
      return company.id.toString();
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);  
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get all jobs with pagination and filters
  async getAllJobs(
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string,
    category?: string,
    startSalary?: string,
    endSalary?: string,
    location?: string
  ): Promise<{ jobs: IJob[], total: number }> {
    try {
      console.log("Search term in service:", search);
      return await this._jobRepository.getAllJobs(
        page, 
        pageSize,
        search,
        jobType, 
        category,
        startSalary,
        endSalary, 
        location
      );
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error); 
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get job by ID
  async getJobById(id: string): Promise<IJob | null> {
    try {
      return await this._jobRepository.getJobById(id);
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);  
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get jobs for a recruiter with pagination and filters
  async getRecruiterJobs(
    recruiterId: string,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }> {
    try {
      const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId) as unknown as mongoose.Schema.Types.ObjectId;
      return await this._jobRepository.getRecruiterJobs(
        recruiterObjectId,
        page,
        pageSize,
        search,
        jobType
      );
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRecruiterShortListedJobs(
    recruiterId: string,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }> {
    try {
      const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId) as unknown as mongoose.Schema.Types.ObjectId;
      return await this._jobRepository.getRecruiterShortListedJobs(
        recruiterObjectId,
        page,
        pageSize,
        search,
        jobType
      );
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get jobs applied by the user
  async getAppliedJobs(userId: string): Promise<IJob[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(Messages.INVALID_USER_ID); 
      throw new Error(Messages.INVALID_USER_ID);
    }

    try {
      const user = await User.findById(userId).populate('jobs');
      if (!user) {
        console.error(Messages.USER_NOT_FOUND); 
        throw new Error(Messages.USER_NOT_FOUND);
      }
      const jobIds: mongoose.Types.ObjectId[] = user.jobs ? user.jobs.map(jobId => new mongoose.Types.ObjectId(jobId)) : [];
      return this._jobRepository.findJobsByIds(jobIds);
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }


    // Get jobs shortListed by the user
    async getShortListedJobs(userId: string): Promise<IJob[]> {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(Messages.INVALID_USER_ID); 
        throw new Error(Messages.INVALID_USER_ID);
      }
  
      try {
        const user = await User.findById(userId).populate('jobs');
        if (!user) {
          console.error(Messages.USER_NOT_FOUND); 
          throw new Error(Messages.USER_NOT_FOUND);
        }
        const jobIds: mongoose.Types.ObjectId[] = user.jobs ? user.jobs.map(jobId => new mongoose.Types.ObjectId(jobId)) : [];
        return this._jobRepository.findJobsByIds(jobIds);
      } catch (error) {
        console.error(Messages.UNKNOWN_ERROR, error);
        throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }


  // Update job details
  async updateJob(id: string, jobData: Partial<IJob>): Promise<IJob | null> {
    try {
      const updatedJob = await this._jobRepository.updateJob(id, jobData);
      if (!updatedJob) {
        console.error(Messages.JOB_NOT_FOUND); 
        throw new Error(Messages.JOB_NOT_FOUND);
      }
      console.log(Messages.JOB_UPDATED); 
      return updatedJob;
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error); 
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Delete job by ID
  async deleteJob(id: string): Promise<IJob | null> {
    try {
      const deletedJob = await this._jobRepository.deleteJob(id);
      if (!deletedJob) {
        console.error(Messages.JOB_NOT_FOUND); 
        throw new Error(Messages.JOB_NOT_FOUND);
      }
      console.log(Messages.JOB_DELETED); 
      return deletedJob;
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);  
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Apply for a job
  async applyForJob(jobId: string, userId: string): Promise<{ job: IJob | null, user: IUser | null }> {
    try {
      return await this._jobRepository.applyForJob(jobId, userId);
    } catch (error: any) {
      console.error('Error in service:', error);
  
      // Check for the specific error message
      if (error.message === 'You have already applied for this job.') {
        throw new Error('You have already applied for this job.');
      } else {
        throw new Error(Messages.UNKNOWN_ERROR);
      }
    }
  }
  

  // Get jobs with applicants for a recruiter
  async getJobsWithApplicants(recruiterId: string): Promise<IJob[]> {
    try {
      const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);
      const jobs = await this._jobRepository.getApplicantsByJob(recruiterObjectId);

      const jobsWithApplicants = await Promise.all(jobs.map(async (job) => {
        const populatedJob = await job.populate('applicants');
        return populatedJob;
      }));

      return jobsWithApplicants;
    } catch (error) {
      console.error(Messages.UNKNOWN_ERROR, error);
      throw new Error(`${Messages.UNKNOWN_ERROR}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateApplicationStatus(jobId: string, userId: string, status: string): Promise<IJob | null> {
    return await this._jobRepository.updateApplicationStatus(jobId, userId, status);
}


}
 