import { Request, Response } from 'express';

export interface IAdminController {
  login(req: Request, res: Response): Promise<void>;
  createAdmin(req: Request, res: Response): Promise<void>;
  getPendingRecruiters(req: Request, res: Response): Promise<Response>;
  getRecruiters(req: Request, res: Response): Promise<Response>;
  approveRecruiter(req: Request, res: Response): Promise<Response>;
  rejectRecruiter(req: Request, res: Response): Promise<Response>;
  getUsers(req: Request, res: Response): Promise<Response>;
  blockOrUnblockRecruiter(req: Request, res: Response): Promise<Response>;
  blockOrUnblockUser(req: Request, res: Response): Promise<Response>;
  generatePredefinedUrl(req: Request, res: Response): Promise<void>;
  generateJobReport(req: Request, res: Response): Promise<Response>
}
