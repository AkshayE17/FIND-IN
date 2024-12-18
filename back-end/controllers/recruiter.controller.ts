import { Request, Response } from 'express';
import { IRecruiterService } from '../interfaces/recruiters/IRecruiterService';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';
import { IOtpService } from '../interfaces/otp/IOtpService';
import { IRecruiterController } from '../interfaces/recruiters/IRecruiterController';

export class RecruiterController implements IRecruiterController {
  constructor(
    private _recruiterService: IRecruiterService,
    private _otpService: IOtpService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const recruiter = await this._recruiterService.registerRecruiter(req.body);
      await this._otpService.sendOtpToEmail(req.body.email);
      
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
      const { recruiter, accessToken, refreshToken } = await this._recruiterService.loginRecruiter(email, password);

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

  async updateRecruiter(req: Request, res: Response): Promise<void> {
   console.log(" entering to update recruiter controller");
    const updatedData = req.body;
    const recruiterId = updatedData._id;
    try {
      const updatedRecruiter = await this._recruiterService.updateRecruiter(recruiterId, updatedData);
      if (updatedRecruiter) {
        res.status(HttpStatus.OK).json({ message: Messages.USER_UPDATED, recruiter: updatedRecruiter });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.RECRUITER_NOT_FOUND });
      }
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      await this._otpService.verifyOtp(email, otp);
      await this._recruiterService.verifyOtp(email);
      
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
  
      await this._recruiterService.changeRecruiterPassword(recruiterId, currentPassword, newPassword);
  
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
  async checkMobileExists(req: Request, res: Response): Promise<void> {
    try {

        const { mobile } = req.body;
        const exists = await this._recruiterService.checkMobileExists(mobile);
        if (exists) {
            res.status(400).json({ message: 'Mobile number already exists.' });
        } else {
            res.status(200).json({ message: 'Mobile number is unique.' });
        }
    } catch (error) {
        console.error('Error in checkMobileExists:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

}