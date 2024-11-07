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

      console.log("Search term:", search);

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
    } catch (error) {
      console.error("Error applying for job:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
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
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
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
}
