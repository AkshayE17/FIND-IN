
import { Admin, IAdmin } from '../models/admin';
import Recruiter, { IRecruiter } from '../models/Recruiter';
import User, { IUser, UFilterOptions } from '../models/User';
import { FilterOptions } from '../models/Recruiter';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';
import { BaseRepository } from './base.repository';

class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      return await this.model.findOne({ email }).exec();
    } catch (error: unknown) {
      throw new Error(`Error finding admin by email: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
    try {
      return await this.create(adminData);
    } catch (error: unknown) {
      throw new Error(`Error creating admin: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findRecruiters(
    offset: number,
    limit: number,
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const baseQuery: any = { isApproved: 'approved' };
      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }
      if (filters.company) {
        baseQuery.companyName = { $regex: filters.company, $options: 'i' };
      }
      if (filters.startDate || filters.endDate) {
        baseQuery.updatedAt = {};
        if (filters.startDate) baseQuery.updatedAt.$gte = new Date(filters.startDate);
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.updatedAt.$lte = endDate;
        }
      }
      if (filters.isBlocked !== undefined) baseQuery.isBlocked = filters.isBlocked;

      const total = await Recruiter.countDocuments(baseQuery);
      const recruiters = await Recruiter.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return { recruiters, total };
    } catch (error: unknown) {
      throw new Error(`Error finding recruiters: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getRecruiterByEmail(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await Recruiter.findOne({ email }).exec();
      if (!recruiter) throw new Error('Recruiter not found');
      return recruiter;
    } catch (error: unknown) {
      throw new Error(`Error finding recruiter by email: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findPendingRecruiters(
    offset: number,
    limit: number,
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const baseQuery: any = { isApproved: 'Pending' };
      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }
      if (filters.company) baseQuery.companyName = { $regex: filters.company, $options: 'i' };
      if (filters.startDate || filters.endDate) {
        baseQuery.createdAt = {};
        if (filters.startDate) baseQuery.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.createdAt.$lte = endDate;
        }
      }
      const total = await Recruiter.countDocuments(baseQuery);
      const recruiters = await Recruiter.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return { recruiters, total };
    } catch (error: unknown) {
      throw new Error(`Error finding pending recruiters: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateRecruiterStatus(email: string, status: 'approved' | 'rejected'): Promise<IRecruiter | null> {
    try {
      return await Recruiter.findOneAndUpdate({ email }, { isApproved: status }, { new: true }).exec();
    } catch (error: unknown) {
      throw new Error(`Error updating recruiter status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findUsers(
    offset: number,
    limit: number,
    search: string,
    filters: UFilterOptions
  ): Promise<{ users: IUser[], total: number }> {
    try {
      const baseQuery: any = {};
      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      if (filters.gender) baseQuery.gender = { $regex: filters.gender, $options: 'i' };
      if (filters.startDate || filters.endDate) {
        baseQuery.createdAt = {};
        if (filters.startDate) baseQuery.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.createdAt.$lte = endDate;
        }
      }
      if (filters.isBlocked !== undefined) baseQuery.isBlocked = filters.isBlocked;

      const total = await User.countDocuments(baseQuery);
      const users = await User.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      return { users, total };
    } catch (error: unknown) {
      throw new Error(`Error finding users: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async blockOrUnblockRecruiter(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await Recruiter.findOne({ email }).exec();
      if (!recruiter) throw new Error('Recruiter not found');
      return await Recruiter.findOneAndUpdate(
        { email },
        { isBlocked: !recruiter.isBlocked },
        { new: true }
      ).exec();
    } catch (error: unknown) {
      throw new Error(`Error toggling recruiter block status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async blockOrUnblockUser(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email }).exec();
      if (!user) throw new Error('User not found');
      return await User.findOneAndUpdate(
        { email },
        { isBlocked: !user.isBlocked },
        { new: true }
      ).exec();
    } catch (error: unknown) {
      throw new Error(`Error toggling user block status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new AdminRepository();
