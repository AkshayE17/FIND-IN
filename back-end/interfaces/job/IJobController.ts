import { Request, Response } from 'express';

export interface IJobController {
  createJob(req: Request, res: Response): Promise<void>;
  getAllJobs(req: Request, res: Response): Promise<void>;
  getJobById(req: Request<{ id: string }>, res: Response): Promise<void>;
  getRecruiterJob(req: Request, res: Response): Promise<void>;
  getRecruiterShortListedJob(req: Request, res: Response): Promise<void>;
  updateJob(req: Request, res: Response): Promise<void>;
  deleteJob(req: Request<{ id: string }>, res: Response): Promise<void>;
  applyForJob(req: Request<{ jobId: string }>, res: Response): Promise<void>;
  appliedJobs(req: Request<{ userId: string }>, res: Response): Promise<void>;
  getJobsWithApplicants(req: Request, res: Response): Promise<void>;
}
