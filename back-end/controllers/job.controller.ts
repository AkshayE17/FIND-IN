import { Request, Response } from 'express';
import { IJobController } from '../interfaces/job/IJobController';
import { IJobService } from '../interfaces/job/IJobService';
import { HttpStatus } from '../constants/http.constants';
import { Messages } from '../constants/message.constants';

export class JobController implements IJobController {

  constructor(private _jobService: IJobService) {}

  async createJob(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.body.recruiterId;
      if (!recruiterId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.RECRUITER_ID_REQUIRED });
        return;
      }

      const companyId = await this._jobService.getCompanyIdByRecruiterId(recruiterId);
      if (!companyId) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.COMPANY_NOT_FOUND_FOR_RECRUITER });
        return;
      }

      const jobData = { ...req.body };
      const job = await this._jobService.createJob(jobData);
      res.status(HttpStatus.CREATED).json(job); 
    } catch (error) {
      console.error("Error in createJob:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async getAllJobs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const jobType = req.query.jobType as string;
      const category = req.query.category as string;
      const startSalary = req.query.startSalary as string;
      const endSalary = req.query.endSalary as string;
      const location = req.query.location as string;


      const result = await this._jobService.getAllJobs(
        page,
        pageSize,
        search,
        jobType,
        category,
        startSalary,
        endSalary,
        location
      );

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Error in getAllJobs:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async getJobById(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const job = await this._jobService.getJobById(req.params.id);
      if (!job) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json(job);
    } catch (error) {
      console.error("Error in getJobById:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async getRecruiterJob(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.query.recruiterId as string;
      if (!recruiterId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.RECRUITER_ID_REQUIRED });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const jobType = req.query.jobType as string;

      const result = await this._jobService.getRecruiterJobs(
        recruiterId,
        page,
        pageSize,
        search,
        jobType
      );

      // console.log("recruiter jobs:", JSON.stringify(result, null, 2));


      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Error in getRecruiterJob:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }


  async getRecruiterShortListedJob(req: Request, res: Response): Promise<void> {
    try {
      console.log("getRecruiterShortListedJob");
      const recruiterId = req.query.recruiterId as string;
      if (!recruiterId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.RECRUITER_ID_REQUIRED });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string;
      const jobType = req.query.jobType as string;

      const result = await this._jobService.getRecruiterShortListedJobs(
        recruiterId,  
        page,
        pageSize,
        search,
        jobType
      );

      console.log("recruiter jobs in shortlisted:", JSON.stringify(result, null, 2));


      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error("Error in getRecruiterJob:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }


  async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.id;
      const jobData = { ...req.body };
      console.log("Job ID:", jobId);
      console.log("Job data:", jobData);

      const updatedJob = await this._jobService.updateJob(jobId, jobData);
      if (!updatedJob) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json(updatedJob);
    } catch (error) {
      console.error("Error in updateJob:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async deleteJob(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const deletedJob = await this._jobService.deleteJob(req.params.id);
      if (!deletedJob) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      console.error("Error in deleteJob:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async applyForJob(req: Request<{ jobId: string }>, res: Response): Promise<void> {
    try {
      const userId = req.body.userId;
      const jobId = req.params.jobId;

      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.USER_ID_REQUIRED });
        return;
      }

      const job = await this._jobService.applyForJob(jobId, userId);
      if (!job) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.JOB_NOT_FOUND });
        return;
      }
      res.status(HttpStatus.OK).json({ message: Messages.APPLICATION_SUCCESSFUL, job });
    } catch (error:any) {
      console.error("Error in controller:", error);
      if (error.message === 'You have already applied for this job.') {
        console.log("message are equal");
        res.status(HttpStatus.CONFLICT).json({ message: 'You have already applied for this job.' });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
      
    }
 }

 async appliedJobs(req: Request<{ userId: string }>, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const jobs = await this._jobService.getAppliedJobs(userId);

    if (!jobs.length) {
      res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NO_APPLIED_JOBS_FOUND });
      return;
    }

    res.status(HttpStatus.OK).json(jobs);
  } catch (error: any) {
    console.error("Error fetching applied jobs:", error);

    // Check for the specific error message
    if (error.message === 'You have already applied for this job.') {
      res.status(HttpStatus.CONFLICT).json({ message: 'You have already applied for this job.' });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
}


async shortListedJobs(req: Request<{ userId: string }>, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const jobs = await this._jobService.getShortListedJobs(userId);

    if (!jobs.length) {
      res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NO_APPLIED_JOBS_FOUND });
      return;
    }

    res.status(HttpStatus.OK).json(jobs);
  } catch (error: any) {
    console.error("Error fetching applied jobs:", error);

    // Check for the specific error message
    if (error.message === 'You have already applied for this job.') {
      res.status(HttpStatus.CONFLICT).json({ message: 'You have already applied for this job.' });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
}

  async getJobsWithApplicants(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = req.query.recruiterId as string;
      if (!recruiterId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.RECRUITER_ID_REQUIRED });
        return;
      }

      const jobsWithApplicants = await this._jobService.getJobsWithApplicants(recruiterId);

      if (!jobsWithApplicants.length) {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.NO_JOBS_FOUND_FOR_RECRUITER });
        return;
      }

      res.status(HttpStatus.OK).json(jobsWithApplicants);
    } catch (error) {
      console.error("Error in getJobsWithApplicants:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  // In JobController
async updateApplicationStatus(req: Request, res: Response): Promise<void> {
  try {
    console.log('Updating application status in controlller...');
    const jobId = req.params.jobId;
    const userId = req.params.userId;
    const { status } = req.body; 

    console.log("jobId:", jobId);
    console.log("userId:", userId);
    console.log("status:", status);
    
    if (!status) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'Status is required' });
      return;
    }

    const updatedApplication = await this._jobService.updateApplicationStatus(jobId, userId, status);
    
    if (!updatedApplication) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Job or Applicant not found' });
      return;
    }

    res.status(HttpStatus.OK).json({ message: 'Application status updated successfully', updatedApplication });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while updating the application status' });
  }
}

}
