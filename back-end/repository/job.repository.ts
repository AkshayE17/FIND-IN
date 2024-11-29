import { IJobRepository } from '../interfaces/job/IJobRepository';
import { JobModel } from '../models/job';
import { IJob } from '../models/job';
import mongoose, { ObjectId, Types } from 'mongoose';
import User from '../models/User';
import { IUser } from '../models/User';
import { BaseRepository } from './base.repository';

class JobRepository extends BaseRepository<IJob> implements IJobRepository {
  constructor() {
    super(JobModel); 
  }

  async createJob(jobData: IJob): Promise<IJob> {
    const job = new JobModel(jobData);
    return await job.save();
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
    const query: any = {};
    
    if (search) {
      console.log("Search term in repository:", search);
      query.jobTitle = { $regex: search, $options: 'i' }; 
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
      .populate('companyId recruiterId')  // Populate company and recruiter
      .populate('applicants.userId')
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });
  
    return { jobs, total };
  }
  
  async getRecruiterJobs(
    recruiterId: ObjectId,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }> {
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
    .sort({ createdAt: -1 })
    .populate({
      path: 'applicants.userId',
      model: 'User',
      populate: { path: 'professionalDetails', model: 'ProfessionalDetails' },
    }).lean()
  
  const filteredJobs = jobs.map(job => ({
    ...job,
    applicants: job.applicants.filter(applicant => applicant.applicationStatus === 'applied')
  }));
  
    
    return { jobs:filteredJobs, total };
  }
  


  //SHORTLISTED JOBS
  async getRecruiterShortListedJobs(
    recruiterId: ObjectId,
    page: number,
    pageSize: number,
    search?: string,
    jobType?: string
  ): Promise<{ jobs: IJob[], total: number }> {
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
      .sort({ createdAt: -1 })
      .populate({
        path: 'applicants.userId',
        model: 'User',
        populate: { path: 'professionalDetails', model: 'ProfessionalDetails' },
      })
      .lean();
  
    const filteredJobs = jobs
      .map((job) => ({
        ...job,
        applicants: job.applicants.filter((applicant) => applicant.applicationStatus === 'shortlisted')
      }))
      .filter((job) => job.applicants.length > 0);
  
    console.log("Filtered Jobs in repository:", filteredJobs);
  
    return { jobs: filteredJobs, total };
  }
  
  
  async getJobById(id: string): Promise<IJob | null> {
    return JobModel.findById(id)
      .populate('companyId', 'logo companyName contactNumber companyWebsite about city country')
      .populate('recruiterId', 'name email officialEmail mobile gender jobTitle companyName companyWebsite imageUrl');
  }

  async updateJob(id: string, jobData: Partial<IJob>): Promise<IJob | null> {
    return await JobModel.findByIdAndUpdate(id, jobData, { new: true });
}

    
  async deleteJob(id: string): Promise<IJob | null> {
    return await JobModel.findByIdAndDelete(id);
  }

 // repository method: applyForJob
 async applyForJob(jobId: string, userId: string): Promise<{ job: IJob | null, user: IUser | null }> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const job = await JobModel.findOne({ _id: jobId, "applicants.userId": new mongoose.Types.ObjectId(userId) }).session(session);
    
    if (job) {
      throw new Error('You have already applied for this job.'); 
    }

    // Continue with application logic
    const updatedJob = await JobModel.findByIdAndUpdate(
      jobId,
      { $addToSet: { applicants: { userId: new mongoose.Types.ObjectId(userId), applicationStatus: "applied", appliedDate: new Date() } } },
      { new: true, session }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { jobs: jobId } },
      { new: true, session }
    );

    if (!updatedJob || !updatedUser) {
      await session.abortTransaction();
      session.endSession();
      return { job: null, user: null };
    }

    await session.commitTransaction();
    session.endSession();

    return { job: updatedJob, user: updatedUser };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;  // Propagate the error to be caught in the service or controller
  }
}


  
  async findJobsByIds(jobIds: Types.ObjectId[]): Promise<IJob[]> {
    return await JobModel.find({ _id: { $in: jobIds } })
        .populate('recruiterId') 
        .populate('companyId')    
        .exec();
  }

  async getApplicantsByJob(recruiterId: mongoose.Types.ObjectId): Promise<IJob[]> {
    return JobModel.find({ recruiterId }).populate('applicants').exec();
  }


  async updateApplicationStatus(jobId: string, userId: string, status: string): Promise<IJob | null> {
    try {
        const updatedJob = await JobModel.findOneAndUpdate(
            {
                _id: jobId,
                'applicants.userId': userId 
            },
            {
                $set: { 'applicants.$.applicationStatus': status }
            },
            { new: true } // Return the updated document
        );

        return updatedJob;
    } catch (error) {
        console.error('Error updating application status in repository:', error);
        throw new Error('Failed to update application status');
    }
}

}

export default new JobRepository();
