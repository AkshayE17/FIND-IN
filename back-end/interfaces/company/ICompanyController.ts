import { Request, Response } from 'express';

export interface ICompanyController {
  createOrUpdateCompany(req: Request, res: Response): Promise<void>;
  getCompanyByHrId(req: Request, res: Response): Promise<void>;
}
