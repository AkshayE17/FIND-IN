import Recruiter from '../models/Recruiter';
import { IRecruiter } from '../models/Recruiter';

export class RecruiterRepository {
  async createRecruiter(recruiterData: IRecruiter): Promise<IRecruiter> {
    const recruiter = new Recruiter(recruiterData);
    return await recruiter.save();
  }

  async findRecruiterByEmail(email: string): Promise<IRecruiter | null> {
    return await Recruiter.findOne({ email });
  }



  async updateRecruiter(id: string, updateData: Partial<IRecruiter>): Promise<IRecruiter | null> {
    return await Recruiter.findByIdAndUpdate(id, updateData, { new: true });
  }


}
