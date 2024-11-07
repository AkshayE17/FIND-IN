import { IOtpRepository } from "../interfaces/otp/IOtpRepository";
import { sendOtpEmail } from "../util/mail.util";
import { generateOtp } from "../util/otp.util";
import { IOtpService } from "../interfaces/otp/IOtpService";

export class OtpService implements IOtpService {
    constructor(private _otpRepository: IOtpRepository) {}

    async sendOtpToEmail(email: string): Promise<void> {
        try {
            const otp = generateOtp();
            await this._otpRepository.createOtp(email, otp);
            await sendOtpEmail(email, otp);
        } catch (error) {
            throw new Error(`Failed to send OTP to email: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async verifyOtp(email: string, otp: number): Promise<void> {
        try {
            const otpEntry = await this._otpRepository.findOtp(email, otp);
            if (!otpEntry) {
                throw new Error('Invalid OTP or OTP expired');
            }

            await this._otpRepository.deleteOtp(email);
        } catch (error) {
            if (error instanceof Error && error.message === 'Invalid OTP or OTP expired') {
                throw error;  
            }
        
            throw new Error(`Failed to verify OTP: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
