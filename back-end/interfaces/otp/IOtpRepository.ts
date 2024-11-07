import { IOtp } from "../../models/Otp";

export interface IOtpRepository {
  createOtp(email: string, otp: number): Promise<IOtp>;
  findOtp(email: string, otp: number): Promise<IOtp | null>;
  deleteOtp(email: string): Promise<void>;
}
