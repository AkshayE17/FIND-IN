import Recruiter from '../models/Recruiter';
import { IRecruiter } from '../models/Recruiter';
import { IRecruiterRepository } from '../interfaces/recruiters/IRecruiterRepository';

class RecruiterRepository implements IRecruiterRepository {

  // Create a new recruiter
  async createRecruiter(recruiterData: IRecruiter): Promise<IRecruiter> {
    try {
      const recruiter = new Recruiter(recruiterData);
      return await recruiter.save();
    } catch (error) {
      console.error("Error creating recruiter", error);
      throw new Error("Error creating recruiter");
    }
  }

  // Find recruiter by email
  async findRecruiterByEmail(email: string): Promise<IRecruiter | null> {
    try {
      return await Recruiter.findOne({ email });
    } catch (error) {
      console.error(`Error finding recruiter with email: ${email}`, error);
      throw new Error("Error finding recruiter by email");
    }
  }

  // Update recruiter details by ID
  async updateRecruiter(id: string, updateData: Partial<IRecruiter>): Promise<IRecruiter | null> {
    try {
      return await Recruiter.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error(`Error updating recruiter with ID: ${id}`, error);
      throw new Error("Error updating recruiter");
    }
  }
}

export default new RecruiterRepository();
