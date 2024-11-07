import { Admin, IAdmin } from '../models/admin';
import Recruiter, { IRecruiter } from '../models/Recruiter';
import User, { IUser, UFilterOptions } from '../models/User';
import { FilterOptions } from '../models/Recruiter';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    try {
      return await Admin.findOne({ email });
    } catch (error: unknown) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  }

  async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
    try {
      const admin = new Admin(adminData);
      return await admin.save();
    } catch (error: unknown) {
      console.error('Error creating admin:', error);
      throw error;
    }
  }

  async findRecruiters(
    offset: number, 
    limit: number, 
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const baseQuery: any = {
        isApproved: 'approved'
      };

      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ];
      }

      if (filters.company) {
        baseQuery.companyName = { $regex: filters.company, $options: 'i' };
      }

      if (filters.startDate || filters.endDate) {
        baseQuery.updatedAt = {};
        
        if (filters.startDate) {
          baseQuery.updatedAt.$gte = new Date(filters.startDate);
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.updatedAt.$lte = endDate;
        }
      }

      if (filters.isBlocked !== undefined) {
        console.log('isBlocked filter applied:', filters.isBlocked);
        baseQuery.isBlocked = filters.isBlocked;
      }

      const total = await Recruiter.countDocuments(baseQuery);
      const recruiters = await Recruiter.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });

      return { recruiters, total };
    } catch (error: unknown) {
      console.error('Error fetching recruiters:', error);
      throw error;
    }
  }

  async getRecruiterByEmail(email: string): Promise<IRecruiter> {
    try {
      const recruiter = await Recruiter.findOne({ email });
      if (!recruiter) {
        throw new Error('Recruiter not found');
      }
      return recruiter;
    } catch (error: unknown) {
      console.error('Error finding recruiter by email:', error);
      throw error;
    }
  }

  async findPendingRecruiters(
    offset: number, 
    limit: number, 
    search: string,
    filters: FilterOptions
  ): Promise<{ recruiters: IRecruiter[], total: number }> {
    try {
      const baseQuery: any = {
        isApproved: 'Pending'
      };

      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } }
        ];
      }

      if (filters.company) {
        baseQuery.companyName = { $regex: filters.company, $options: 'i' };
      }

      if (filters.startDate || filters.endDate) {
        baseQuery.createdAt = {};
        
        if (filters.startDate) {
          baseQuery.createdAt.$gte = new Date(filters.startDate);
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.createdAt.$lte = endDate;
        }
      }

      console.log("base recruiter query:", baseQuery);
      const total = await Recruiter.countDocuments(baseQuery);
      const recruiters = await Recruiter.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });

      return { recruiters, total };
    } catch (error: unknown) {
      console.error('Error fetching pending recruiters:', error);
      throw error;
    }
  }

  async updateRecruiterStatus(email: string, status: 'approved' | 'rejected'): Promise<IRecruiter | null> {
    try {
      return await Recruiter.findOneAndUpdate({ email }, { isApproved: status }, { new: true });
    } catch (error: unknown) {
      console.error('Error updating recruiter status:', error);
      throw error;
    }
  }

  async findUsers(
    offset: number, 
    limit: number, 
    search: string,
    filters: UFilterOptions
  ): Promise<{ users: IUser[], total: number }> {
    try {
      console.log("entering get users");

      const baseQuery: any = {};

      if (search) {
        baseQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (filters.gender) {
        baseQuery.gender = { $regex: filters.gender, $options: 'i' };
      }

      if (filters.startDate || filters.endDate) {
        baseQuery.createdAt = {};
        if (filters.startDate) {
          baseQuery.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setDate(endDate.getDate() + 1);
          baseQuery.createdAt.$lte = endDate;
        }
      }

      if (filters.isBlocked !== undefined) {
        baseQuery.isBlocked = filters.isBlocked;
      }

      console.log("base user query:", baseQuery);

      const total = await User.countDocuments(baseQuery);
      const users = await User.find(baseQuery)
        .skip(offset)
        .limit(limit)
        .sort({ createdAt: -1 });

      return { users, total };
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async blockOrUnblockRecruiter(email: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await Recruiter.findOne({ email });

      if (!recruiter) {
        throw new Error('Recruiter not found');
      }

      const updatedRecruiter = await Recruiter.findOneAndUpdate(
        { email },
        { isBlocked: !recruiter.isBlocked },
        { new: true }
      );

      return updatedRecruiter;
    } catch (error: unknown) {
      console.error('Error blocking or unblocking recruiter:', error);
      throw error;
    }
  }

  async blockOrUnblockUser(email: string): Promise<IUser | null> {
    try {
      console.log("entering the block or unblock repository");

      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await User.findOneAndUpdate(
        { email },
        { isBlocked: !user.isBlocked },
        { new: true }
      );

      return updatedUser;
    } catch (error: unknown) {
      console.error('Error blocking or unblocking user:', error);
      throw error;
    }
  }
}

export default new AdminRepository();
