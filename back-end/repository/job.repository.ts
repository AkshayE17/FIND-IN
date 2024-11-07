import { IJobRepository } from '../interfaces/job/IJobRepository';
import { JobModel } from '../models/job';
import { IJob } from '../models/job';
import mongoose, { ObjectId, Types } from 'mongoose';
import User from '../models/User';
import { IUser } from '../models/User';

class JobRepository implements IJobRepository {
  async createJob(jobData: IJob): Promise<IJob> {
    try {
      const job = new JobModel(jobData);
      return await job.save();
    } catch (error: unknown) {
      throw new Error(`Error while creating the job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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
      const query: any = {};
      
      if (search) {
        query.title = { $regex: search, $options: 'i' }; 
      }
    
      if (jobType) query.jobType = jobType;
      if (category) query.category = category;
      if (location) query.location = location;
    
      if (startSalary || endSalary) {
        query.salary = {};
        if (startSalary) query.salary.$gte = Number(startSalary);
        if (endSalary) query.salary.$lte = Number(endSalary);
      }
    
      const skip = (page - 1) * pageSize;
      const total = await JobModel.countDocuments(query);
      const jobs = await JobModel.find(query)
        .populate('companyId recruiterId applicants')
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }); 
    
      return { jobs, total };
    } catch (error: unknown) {
      throw new Error(`Error while retrieving all jobs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRecruiterJobs(
    recruiterId: ObjectId,
    page: number,
    pageSize: number,
    search?: string,  
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }> {
    try {
      const query: any = { recruiterId }; 
      
      if (search) {
        query.jobTitle = { $regex: search, $options: 'i' };
      }
      if (jobType) {
        query.jobType = jobType;
      }
    
      const skip = (page - 1) * pageSize;
      const total = await JobModel.countDocuments(query);
      const jobs = await JobModel.find(query)
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 }); 
    
      return { jobs, total };
    } catch (error: unknown) {
      throw new Error(`Error while retrieving recruiter jobs: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getJobById(id: string): Promise<IJob | null> {
    try {
      const jobDetails = await JobModel.findById(id)
        .populate('companyId', 'logo companyName contactNumber companyWebsite about city country')
        .populate('recruiterId', 'name email officialEmail mobile gender jobTitle companyName companyWebsite imageUrl');
  
      return jobDetails;
    } catch (error: unknown) {
      throw new Error(`Error while retrieving the job by id: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateJob(id: string, jobData: Partial<IJob>): Promise<IJob | null> {
    try {
      return await JobModel.findByIdAndUpdate(id, jobData, { new: true });
    } catch (error: unknown) {
      throw new Error(`Error while updating the job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async deleteJob(id: string): Promise<IJob | null> {
    try {
      return await JobModel.findByIdAndDelete(id);
    } catch (error: unknown) {
      throw new Error(`Error while deleting the job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async applyForJob(jobId: string, userId: string): Promise<{ job: IJob | null, user: IUser | null }> {
    const session = await mongoose.startSession();
    session.startTransaction(); 
  
    try {
      const job = await JobModel.findByIdAndUpdate(
        jobId,
        { $addToSet: { applicants: userId } },
        { new: true, session } 
      );

      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { jobs: jobId } },
        { new: true, session } 
      );
  
      if (!job || !user) {
        await session.abortTransaction();
        session.endSession();
        return { job: null, user: null };
      }
      await session.commitTransaction();
      session.endSession();
  
      return { job, user };
    } catch (error: unknown) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Error while applying for the job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findJobsByIds(jobIds: Types.ObjectId[]): Promise<IJob[]> { 
    try {
      return await JobModel.find({ _id: { $in: jobIds } })
        .populate('recruiterId') 
        .populate('companyId') 
        .exec();
    } catch (error: unknown) {
      throw new Error(`Error while finding jobs by ids: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getapplicantsbyjob(recruiterId: mongoose.Types.ObjectId): Promise<IJob[]> {
    try {
      return await JobModel.find({ recruiterId }).populate('applicants').exec();
    } catch (error: unknown) {
      throw new Error(`Error while retrieving applicants for the job: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new JobRepository();
