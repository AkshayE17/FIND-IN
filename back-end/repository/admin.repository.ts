
import { Admin, IAdmin } from '../models/admin';
import Recruiter, { IRecruiter } from '../models/Recruiter';
import User, { IUser, UFilterOptions } from '../models/User';
import { FilterOptions } from '../models/Recruiter';
import { IAdminRepository } from '../interfaces/admin/IAdminRepository';
import { BaseRepository } from './base.repository';
import {IJob, JobModel, JobReportData, JobStatistics} from '../models/job';
import { ProfessionalDetailsModel } from '../models/professionalDetails';

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
    email: string,
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

      if(email) baseQuery.email = { $regex: email, $options: 'i' };
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


  // In adminRepository.ts, add this method:
async getDashboardStatistics(): Promise<JobStatistics> {
  try {
    // Count total jobs
    const totalJobs = await JobModel.countDocuments();

    // Count total applicants
    const totalApplicants = await JobModel.aggregate([
      { $unwind: "$applicants" },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0, count: 1 } }
    ]);

    // Jobs by category
    const jobsByCategory = await JobModel.aggregate([
      { $group: { 
          _id: "$jobCategory", 
          count: { $sum: 1 } 
      }},
      { $project: { 
          jobCategory: "$_id", 
          count: 1, 
          _id: 0 
      }}
    ]);
    

    // Applicants by skill (from professional details)
    const applicantsBySkill = await ProfessionalDetailsModel.aggregate([
      { $unwind: "$skills" },
      {
        $group: {
          _id: { $toLower: "$skills" }, 
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } }, // Sort skills by frequency in descending order
      { $limit: 10 }, // Limit to top 10 skills
    ]);
    

    return {
      totalJobs,
      totalApplicants: totalApplicants[0]?.count || 0,
      jobsByCategory: jobsByCategory.map(cat => ({
        category: cat.jobCategory, // Correct field name
        count: cat.count
      })),
      applicantsBySkill: applicantsBySkill.map(skill => ({
        skill: skill.skill,
        count: skill.count
      }))
    };
    
  } catch (error: unknown) {
    throw new Error(`Error fetching dashboard statistics: ${error instanceof Error ? error.message : String(error)}`);
  }
}


async getRecentJobs(limit:number) : Promise<IJob[]>{
  try {
    return await JobModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('jobTitle companyName createdAt')
      .populate('companyId')
      .exec();
    
  } catch (error) {
    console.error('Error in getRecentJobs:', error);
    throw error;
  }
}


async generateJobReport(category?: string): Promise<JobReportData[]> {
  try {
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'companies', 
          localField: 'companyId',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $project: {
          jobTitle: 1,
          companyName: '$company.name',
          totalApplicants: { $size: '$applicants' },
          averageSalary: { $toDouble: '$salary' },
          topSkills: {
            $reduce: {
              input: '$skills',
              initialValue: [],
              in: {
                $setUnion: ['$$value', { $split: ['$$this', ','] }],
              },
            },
          },
        },
      },
    ];

    // Add category filter if provided
    if (category) {
      pipeline.unshift({
        $match: { jobCategory: category },
      });
    }
    pipeline.push({ $sort: { totalApplicants: -1 } });

    // Limit to top 10 reports
    pipeline.push({ $limit: 10 });

    return await JobModel.aggregate(pipeline);
  } catch (error: unknown) {
    throw new Error(`Error generating job report: ${error instanceof Error ? error.message : String(error)}`);
  }
}
}

export default new AdminRepository();
