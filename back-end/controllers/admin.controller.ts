import { Request, Response } from 'express';
import { IAdminService } from '../interfaces/admin/IAdminService';
import { HttpStatus } from '../constants/http.constants';
import { IAdminController } from '../interfaces/admin/IAdminController';

export class AdminController implements IAdminController {
  constructor(private _adminService: IAdminService) {}

  // Admin login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, admin } = await this._adminService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE || '604800000'), 
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE || '900000'),
      });

      res.status(HttpStatus.OK).json({ refreshToken, accessToken, admin: { id: admin._id, email: admin.email } });
    } catch (error: any) {
      console.error("Error during admin login:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  // Admin registration
  async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const admin = await this._adminService.createAdmin(email, password);
      res.status(HttpStatus.CREATED).json(admin);
    } catch (error: any) {
      console.error("Error creating admin:", error);
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  // Get all pending recruiters
  async getPendingRecruiters(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string || '';
      const filters = {
        company: req.query.company as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const { recruiters, total } = await this._adminService.getPendingRecruiters(page, limit, search, filters);

      return res.status(HttpStatus.OK).json({
        recruiters,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error: unknown) {
      console.error("Error fetching pending recruiters:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Get all approved recruiters
  async getRecruiters(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string || '';
      const isBlocked = req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined;
      const filters = {
        company: req.query.company as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        isBlocked,
      };

      console.log('Filters being sent to service:', filters);
      const { recruiters, total } = await this._adminService.getRecruiters(page, limit, search, filters);

      return res.status(HttpStatus.OK).json({
        recruiters,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error: unknown) {
      console.error("Error fetching recruiters:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Approve recruiter
  async approveRecruiter(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    try {
      const updatedRecruiter = await this._adminService.approveRecruiter(email);
      return res.status(HttpStatus.OK).json(updatedRecruiter);
    } catch (error: unknown) {
      console.error("Error approving recruiter:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Reject recruiter
  async rejectRecruiter(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;
    try {
      const updatedRecruiter = await this._adminService.rejectRecruiter(email);
      return res.status(HttpStatus.OK).json(updatedRecruiter);
    } catch (error: unknown) {
      console.error("Error rejecting recruiter:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Get all users
  async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Entering the get all users");
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.pageSize as string) || 10;
      const search = req.query.search as string || '';
      const isBlocked = req.query.isBlocked === 'true' ? true : req.query.isBlocked === 'false' ? false : undefined;
      const filters = {
        gender: req.query.gender as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        isBlocked,
      };

      console.log('Filters being sent to service:', filters);
      const { users, total } = await this._adminService.getUsers(page, limit, search, filters);

      return res.status(HttpStatus.OK).json({
        users,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Block/unblock recruiter
  async blockOrUnblockRecruiter(req: Request, res: Response): Promise<Response> {
    const email = req.body.email;
    try {
      const updatedRecruiter = await this._adminService.blockOrUnblockRecruiter(email);
      return res.status(HttpStatus.OK).json(updatedRecruiter);
    } catch (error: unknown) {
      console.error("Error blocking/unblocking recruiter:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }

  // Block/unblock user
  async blockOrUnblockUser(req: Request, res: Response): Promise<Response> {
    console.log("Entering the block or unblock user");
    const email = req.body.email;
    try {
      const updatedUser = await this._adminService.blockOrUnblockUser(email);
      return res.status(HttpStatus.OK).json(updatedUser);
    } catch (error: unknown) {
      console.error("Error blocking/unblocking user:", error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'An unknown error occurred' });
    }
  }
}
