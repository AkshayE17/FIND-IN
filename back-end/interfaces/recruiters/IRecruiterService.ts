
import { IRecruiter } from "../../models/Recruiter";

export interface IRecruiterService {
  registerRecruiter(recruiterData: IRecruiter): Promise<IRecruiter>;
  verifyOtp(email: string, otp: number): Promise<IRecruiter | null>;
  loginRecruiter(email: string, password: string): Promise<{ recruiter: IRecruiter, accessToken: string, refreshToken: string }>;
  changeRecruiterPassword(id: string, currentPassword: string, newPassword: string): Promise<void>
}
