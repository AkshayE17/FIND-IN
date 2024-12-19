import { Request, Response } from 'express';
import { IUserService } from '../interfaces/users/IUserService';
import jwt from 'jsonwebtoken';
import { Messages } from '../constants/message.constants';
import { HttpStatus } from '../constants/http.constants';
import { IOtpService } from '../interfaces/otp/IOtpService';
import { IUserController } from '../interfaces/users/IUserController';

export class UserController implements IUserController {
  constructor(private _userService: IUserService, private _otpService: IOtpService) {}

  // Create a new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      await this._userService.registerUser(req.body);
      await this._otpService.sendOtpToEmail(req.body.email);
      res.status(HttpStatus.CREATED).json({ message: Messages.USER_CREATED });
    } catch (error: unknown) {
      console.error('Error during user registration:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        message: error instanceof Error ? error.message : Messages.UNKNOWN_ERROR,
      });
    }
  }


  //getUser
  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const user = await this._userService.getUserById(userId);
      console.log("User in user controller: ", user);
      if (user) {
        res.status(HttpStatus.OK).json({ message: Messages.USER_FOUND, user });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
      }
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }
  // Update an existing user
  async updateUser(req: Request, res: Response): Promise<void> {
   
    const updatedData = req.body;
    console.log("updated data",updatedData);
    const userId = updatedData._id;
    console.log("user id",userId);
    try {
      const updatedUser = await this._userService.updateUser(userId, updatedData);
      if (updatedUser) {

        
      console.log("User in user controller: ", updatedUser);
        res.status(HttpStatus.OK).json({ message: Messages.USER_UPDATED, user: updatedUser });
      } else {
        res.status(HttpStatus.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.UNKNOWN_ERROR });
    }
  }

  // Verify OTP
  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      await this._otpService.verifyOtp(email, otp);
      await this._userService.verifyOtp(email);
      res.status(HttpStatus.OK).json({ message: Messages.EMAIL_VERIFIED });
    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error instanceof Error ? error.message : Messages.UNKNOWN_ERROR,
      });
    }
  }

 // User login
async login(req: Request, res: Response): Promise<void> {
  try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this._userService.loginUser(email, password);


      res.cookie('userRefreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE as string, 10),
          sameSite: 'strict',
      });

    

      res.status(HttpStatus.OK).json({
          accessToken,
          user
      });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
          message: error instanceof Error ? error.message : Messages.UNKNOWN_ERROR,
      });
  }
}


  // Refresh token
  async refreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.REFRESH_TOKEN_MISSING });
      return;
    }

    jwt.verify(refreshToken, process.env.JWT_SECRET!, (err: jwt.VerifyErrors | null, user: any) => {
      if (err) {
        console.error('Error verifying refresh token:', err);
        res.status(HttpStatus.FORBIDDEN).json({ message: Messages.INVALID_OR_EXPIRED_REFRESH_TOKEN });
        return;
      }
      const newAccessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
      res.status(HttpStatus.OK).json({ accessToken: newAccessToken });
    });
  }


  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.params.userId;
  
      if (!currentPassword || !newPassword) {
         res.status(HttpStatus.BAD_REQUEST).json({ message: 'Both old and new passwords are required.' });
      }
  
      await this._userService.changeUserPassword(userId, currentPassword, newPassword);
  
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
        const exists = await this._userService.checkMobileExists(mobile);
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
