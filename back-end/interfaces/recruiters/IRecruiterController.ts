import { Request, Response } from 'express';

export interface IRecruiterController {
  register(req: Request, res: Response): Promise<void>;

  login(req: Request, res: Response): Promise<void>;

  verifyOtp(req: Request, res: Response): Promise<void>;
}
