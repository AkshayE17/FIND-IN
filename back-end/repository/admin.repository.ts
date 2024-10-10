
import { Admin, IAdmin } from '../models/admin';
import Recruiter, { IRecruiter } from '../models/Recruiter';
import User, { IUser } from '../models/User';

export class AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email });
  }

  async createAdmin(adminData: Partial<IAdmin>): Promise<IAdmin> {
    const admin = new Admin(adminData);
    return await admin.save();
  }

  
  async getAllPendingRecruiters() {
    return await Recruiter.find({ isApproved: 'pending' }); 
  }

  async getAllRecruiters() {
    return await Recruiter.find({ isApproved: 'approved' }); 
  }

  async approveRecruiter(email:string) {
    const recruiter = await Recruiter.findOneAndUpdate(
      { email },
      { isApproved: 'approved' }, // Update the recruiter status to 'approved'
      { new: true }
    );
    if (!recruiter) {
      throw new Error('Recruiter not found'); // Handle not found case
    }
    return recruiter;
  }

  async rejectRecruiter(email:string) {
    const recruiter = await Recruiter.findOneAndUpdate(
      { email },
      { isApproved: 'rejected' }, // Update the recruiter status to 'rejected'
      { new: true }
    );
    if (!recruiter) {
      throw new Error('Recruiter not found'); // Handle not found case
    }
    return recruiter;
  }

  async getRecruiterByEmail(email:string) {
    const recruiter = await Recruiter.findOne({ email });
    if (!recruiter) {
      throw new Error('Recruiter not found'); // Handle not found case
    }
    return recruiter;
  }

  async findPendingRecruiters(): Promise<IRecruiter[]> {
    console.log("entering recruiter repository")
    return Recruiter.find({ isApproved: 'Pending' });
  }

  async updateRecruiterStatus(email: string, status: 'approved' | 'rejected'): Promise<IRecruiter | null> {
    return Recruiter.findOneAndUpdate({ email }, { isApproved: status }, { new: true });
  }

  async getAllUsers():Promise<IUser[]>{
    return User.find({isVerified:true});
  }

}

export default new AdminRepository();
