import { NextFunction, Request, Response } from 'express';

export interface IJobCategoryController {
  createJobCategory(req: Request, res: Response, next: NextFunction): Promise<Response | undefined>

  getJobCategories(req: Request, res: Response): Promise<void>;

  getAllJobCategories(req: Request, res: Response): Promise<void>;

  updateJobCategory(req: Request, res: Response): Promise<Response | undefined>;

  deleteJobCategory(req: Request, res: Response): Promise<void>;
}
