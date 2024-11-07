import { IRecruiterService } from '../interfaces/recruiters/IRecruiterService';
import { IRecruiterRepository } from '../interfaces/recruiters/IRecruiterRepository';
import { IRecruiter } from '../models/Recruiter';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../util/token.util';
import { hashPassword } from '../util/pass.util';

export class RecruiterService implements IRecruiterService {
  constructor(private _recruiterRepository: IRecruiterRepository) {}

  async registerRecruiter(recruiterData: IRecruiter): Promise<IRecruiter> {
    try {
      const existingRecruiter = await this._recruiterRepository.findRecruiterByEmail(recruiterData.email);
      
      if (existingRecruiter) {
        throw new Error('Recruiter with this email already exists.');
      }

      recruiterData.password = await hashPassword(recruiterData.password);

      const newRecruiter = await this._recruiterRepository.createRecruiter(recruiterData);

      return newRecruiter;
    } catch (error) {
      throw new Error(`Failed to register recruiter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyOtp(email: string, otp: number): Promise<IRecruiter | null> {
    try {
      const recruiter = await this._recruiterRepository.findRecruiterByEmail(email);
      if (!recruiter) {
        throw new Error('Recruiter not found.');
      }

      recruiter.isVerified = true;
      await recruiter.save();
      return recruiter;
    } catch (error) {
      throw new Error(`Failed to verify OTP: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async loginRecruiter(email: string, password: string): Promise<{ recruiter: IRecruiter, accessToken: string, refreshToken: string }> {
    try {
      const recruiter = await this._recruiterRepository.findRecruiterByEmail(email);

      if (!recruiter) {
        throw new Error('Recruiter not found.');
      }

      const isMatch = await bcrypt.compare(password, recruiter.password);

      if (!isMatch) {
        throw new Error('Invalid password');
      }

      if(recruiter.isBlocked === true) {
        throw new Error('User is blocked');
      }

      const accessToken = generateAccessToken(recruiter._id as string);
      const refreshToken = generateRefreshToken(recruiter._id as string);

      return { recruiter, accessToken, refreshToken };
    } catch (error) {
      throw new Error(`Failed to log in recruiter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
