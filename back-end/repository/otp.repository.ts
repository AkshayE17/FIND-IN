import Otp, { IOtp } from "../models/Otp"; 

export class OtpRepository {
    async createOtp(email: string, otp: number): Promise<IOtp> {
        const otpEntry = new Otp({ email, otp });
        return await otpEntry.save();
    }

    async findOtp(email: string, otp: number): Promise<IOtp | null> {
        return await Otp.findOne({ email, otp }).exec();
    }

    async deleteOtp(email: string): Promise<void> { 
      await Otp.deleteOne({ email });
    }
}
