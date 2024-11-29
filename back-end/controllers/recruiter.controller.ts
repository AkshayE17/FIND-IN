import { Request, Response } from 'express';
import { IRecruiterService } from '../interfaces/recruiters/IRecruiterService';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';
import { IOtpService } from '../interfaces/otp/IOtpService';
import { IRecruiterController } from '../interfaces/recruiters/IRecruiterController';

export class RecruiterController implements IRecruiterController {
  constructor(
    private recruiterService: IRecruiterService,
    private otpService: IOtpService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const recruiter = await this.recruiterService.registerRecruiter(req.body);
      await this.otpService.sendOtpToEmail(req.body.email);
      
      res.status(HttpStatus.CREATED).json({
        message: Messages.RECRUITER_CREATED,
        recruiter,
      });  
    } catch (error: unknown) {
      console.error('Error in registering recruiter:', error);
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { recruiter, accessToken, refreshToken } = await this.recruiterService.loginRecruiter(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE as string, 10),
      });

      res.status(HttpStatus.OK).json({
        accessToken,
        recruiter,
      });
    } catch (error: unknown) {
      console.error('Error in recruiter login:', error);
      if (error instanceof Error) {
        res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      await this.recruiterService.verifyOtp(email, otp);
      
      res.status(HttpStatus.OK).json({ message: Messages.EMAIL_VERIFIED });
    } catch (error: unknown) {
      console.error('Error during OTP verification:', error);

      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const recruiterId = req.params.recruiterId;
  
      if (!currentPassword || !newPassword) {
         res.status(HttpStatus.BAD_REQUEST).json({ message: 'Both old and new passwords are required.' });
      }
  
      await this.recruiterService.changeRecruiterPassword(recruiterId, currentPassword, newPassword);
  
      res.status(HttpStatus.OK).json({ message: 'Password changed successfully.' });
    } catch (error: unknown) {
      console.error('Error in changing password:', error);
      if (error instanceof Error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
      }
    }
  }
  
}

