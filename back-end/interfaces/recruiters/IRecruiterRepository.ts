
import { IRecruiter } from "../../models/Recruiter";

export interface IRecruiterRepository {
  createRecruiter(recruiterData: IRecruiter): Promise<IRecruiter>;
  findRecruiterByEmail(email: string): Promise<IRecruiter | null>;
  updateRecruiter(id: string, updateData: Partial<IRecruiter>): Promise<IRecruiter | null>;
  updateRecruiterPassword(id: string, hashedPassword: string): Promise<IRecruiter | null>
  findById(id: string): Promise<IRecruiter | null> ;
  checkMobileExists(mobile: string): Promise<boolean> ;
}
