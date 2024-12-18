import bcrypt from 'bcrypt';
import { IAdminService } from '../interfaces/admin/IAdminService';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';
import { IAdmin } from '../models/admin';
import { IRecruiter } from '../models/Recruiter';
import { IUser, UFilterOptions } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../util/token.util';
import { FilterOptions } from '../models/Recruiter';
import { Messages } from '../constants/message.constants';
import { IJob, JobReportData, JobStatistics } from '../models/job';

export class AdminService implements IAdminService {
  constructor(private _adminRepository: IAdminRepository) {}

  // Admin login
  async login(email: string, password: string) {
    try {
      const admin = await this._adminRepository.findByEmail(email);
      if (!admin) {
        throw new Error(Messages.USER_NOT_FOUND);
      }

      const isPasswordCorrect = await bcrypt.compare(password, admin.password);
      if (!isPasswordCorrect) { 
        throw new Error(Messages.INVALID_PASSWORD);
      }

      const accessToken = generateAccessToken(admin._id as string);
      const refreshToken = generateRefreshToken(admin._id as string);
      console.log(Messages.LOGIN_SUCCESS);
      return { admin, accessToken, refreshToken };
    } catch (error) {
      console.error('Error during admin login:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Create Admin  
  async createAdmin(email: string, password: string): Promise<IAdmin> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await this._adminRepository.createAdmin({ email, password: hashedPassword });
      console.log(Messages.USER_CREATED);
      return admin;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Get Pending Recruiters
  async getPendingRecruiters(
    page: number,
    limit: number,
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      return await this._adminRepository.findPendingRecruiters(offset, limit, search, filters);
    } catch (error) {
      console.error('Error fetching pending recruiters:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Get Recruiters
  async getRecruiters(
    page: number,
    limit: number,
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const offset = (page - 1) * limit;
      return await this._adminRepository.findRecruiters(offset, limit, search, filters);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Approve Recruiter
  async approveRecruiter(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await this._adminRepository.updateRecruiterStatus(email, 'approved');
      if (!recruiter) {
        throw new Error(Messages.RECRUITER_NOT_FOUND);
      }
      console.log(Messages.RECRUITER_CREATED);
      return recruiter;
    } catch (error) {
      console.error('Error approving recruiter:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Reject Recruiter
  async rejectRecruiter(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await this._adminRepository.updateRecruiterStatus(email, 'rejected');
      if (!recruiter) {
        throw new Error(Messages.RECRUITER_NOT_FOUND);
      }
      console.log(Messages.RECRUITER_EXISTS);
      return recruiter;
    } catch (error) {
      console.error('Error rejecting recruiter:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Get Users
  async getUsers(
    page: number,
    limit: number,
    search: string,
    email: string,
    filters: FilterOptions
  ): Promise<{ users: IUser[], total: number }> {
    try {
      console.log('Fetching users...');
      const offset = (page - 1) * limit;
      return await this._adminRepository.findUsers(offset, limit, search, email, filters);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Block or Unblock Recruiter
  async blockOrUnblockRecruiter(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await this._adminRepository.blockOrUnblockRecruiter(email);
      console.log(Messages.RECRUITER_BLOCKED_OR_UNBLOCKED);
      return recruiter;
    } catch (error) {
      console.error('Error blocking/unblocking recruiter:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  // Block or Unblock User
  async blockOrUnblockUser(email: string): Promise<IUser | null> {
    try {
      const user = await this._adminRepository.blockOrUnblockUser(email);
      console.log(Messages.USER_BLOCKED_OR_UNBLOCKED);
      return user;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  async getDashboardStatistics(): Promise<JobStatistics> {
    try {
      return await this._adminRepository.getDashboardStatistics();
    } catch (error) {
      console.error('Error in getDashboardStatistics service:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }
  }

  async getRecentJobs(limit: number) :Promise<IJob[]> {
    try{
      return this._adminRepository.getRecentJobs(limit);
    }catch (error) {
      console.error('Error in getDashboardStatistics service:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }

  }

  async generateJobReport(category?: string): Promise<JobReportData[]> {
    try{
      return this._adminRepository.generateJobReport(category);
    }catch (error) {
      console.error('Error in getDashboardStatistics service:', error);
      throw new Error(error instanceof Error ? error.message : Messages.UNKNOWN_ERROR);
    }

      
  }
}
