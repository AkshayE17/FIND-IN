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
      return await this.update(id, updateData);  
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

  async findById(id: string): Promise<IRecruiter | null> {
    try {
      return await this.findOne({ _id: id });
    } catch (error) {
      console.error("Error in findRecruiterByEmail:", error);
      throw new Error(`Error finding recruiter with email ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateRecruiterPassword(id: string, hashedPassword: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await this.update(id, { password: hashedPassword });
      if (!recruiter) {
        throw new Error('Recruiter not found.');
      }
      return recruiter;
    } catch (error) {
      console.error('Error in updateRecruiterPassword:', error);
      throw new Error(`Error updating password for recruiter with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async checkMobileExists(mobile: string): Promise<boolean> {
    try {
        const recruiter = await this.findOne({ mobile });
        return recruiter ? true : false; // Returns true if mobile exists
    }catch (error: unknown) {
      console.error('Error in checkMobileExists:', error);
      if (error instanceof Error) {
        throw new Error(`Error checking mobile: ${error.message}`);
      } else {
        throw new Error(`Error checking mobile: ${String(error)}`);
      }
    }

  
}
}

export default new RecruiterRepository();
