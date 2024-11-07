import { NextFunction, Request, Response } from 'express';
import { IJobCategory } from '../../models/JobCatogory';

export interface IJobCategoryController {
  createJobCategory(
    req: Request<{}, {}, { name: string; description: string; file?: Express.Multer.File }>,
    res: Response<{}>,
    next: NextFunction
  ): Promise<void>;

  getJobCategories(req: Request, res: Response): Promise<void>;

  getAllJobCategories(req: Request, res: Response): Promise<void>;

  updateJobCategory(req: Request, res: Response): Promise<void>;

  deleteJobCategory(req: Request, res: Response): Promise<void>;
}
