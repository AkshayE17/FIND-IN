import Recruiter, { IRecruiter } from '../models/Recruiter';
import { IRecruiterRepository } from '../interfaces/recruiters/IRecruiterRepository';
import { BaseRepository } from './base.repository';

class RecruiterRepository extends BaseRepository<IRecruiter> implements IRecruiterRepository {
  constructor() {
    super(Recruiter);
  }

  async createRecruiter(recruiterData: IRecruiter): Promise<IRecruiter> {
    try {
      return await this.create(recruiterData);  // Delegate to BaseRepository's create method
    } catch (error) {
      console.error("Error in createRecruiter:", error);
      throw new Error(`Error creating recruiter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateRecruiter(id: string, updateData: Partial<IRecruiter>): Promise<IRecruiter | null> {
    try {
      return await this.update(id, updateData);  // Delegate to BaseRepository's update method
    } catch (error) {
      console.error("Error in updateRecruiter:", error);
      throw new Error(`Error updating recruiter with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findRecruiterByEmail(email: string): Promise<IRecruiter | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error("Error in findRecruiterByEmail:", error);
      throw new Error(`Error finding recruiter with email ${email}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default new RecruiterRepository();
