import Otp, { IOtp } from "../models/Otp";

class OtpRepository {
  // Create OTP entry for a given email and OTP value
  async createOtp(email: string, otp: number): Promise<IOtp> {
    try {
      const otpEntry = new Otp({ email, otp });
      return await otpEntry.save();
    } catch (error) {
      console.error(`Error creating OTP for email: ${email}`, error);
      throw new Error("Error creating OTP");
    }
  }

  // Find OTP entry for a given email and OTP value
  async findOtp(email: string, otp: number): Promise<IOtp | null> {
    try {
      return await Otp.findOne({ email, otp }).exec();
    } catch (error) {
      console.error(`Error finding OTP for email: ${email} with OTP: ${otp}`, error);
      throw new Error("Error finding OTP");
    }
  }

  // Delete OTP entry for a given email
  async deleteOtp(email: string): Promise<void> {
    try {
      await Otp.deleteOne({ email });
    } catch (error) {
      console.error(`Error deleting OTP for email: ${email}`, error);
      throw new Error("Error deleting OTP");
    }
  }
}

export default new OtpRepository();
