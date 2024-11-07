export interface IOtpService {
  sendOtpToEmail(email: string): Promise<void>;
  verifyOtp(email: string, otp: number): Promise<void>;
}
