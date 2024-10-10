import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service'; // Correct import for AdminService


const adminService = new AdminService();

export class AdminController {
  
  //admin login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { token, admin } = await adminService.login(email, password);
      res.status(200).json({ token, admin });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  //admin register
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const admin = await adminService.createAdmin(email, password);
      res.status(201).json(admin);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  //get all pending recruiters
  async getPendingRecruiters(req: Request, res: Response): Promise<Response> {
    try {

      console.log("entering pending recruiters")
      const recruiters = await adminService.getPendingRecruiters();
      console.log(recruiters);
      return res.status(200).json(recruiters);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }

  //get all approved recruiters
  async getRecruiters(req: Request, res: Response): Promise<Response> {
    try {

      console.log("entering recruiters")
      const recruiters = await adminService.getRecruiters();
      console.log(recruiters);
      return res.status(200).json(recruiters);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }

  //approve recruiter
  async approveRecruiter(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    try {
      const updatedRecruiter = await adminService.approveRecruiter(email);
      return res.status(200).json(updatedRecruiter);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }

  //reject recruiter
  async rejectRecruiter(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    try {
      const updatedRecruiter = await adminService.rejectRecruiter(email);
      return res.status(200).json(updatedRecruiter);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }


  //get all users
  async getAllUsers(req:Request,res:Response):Promise<Response>{
    try{
      const allUsers= await adminService.getAllUsers();
      return res.status(200).json(allUsers);
    }catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}


