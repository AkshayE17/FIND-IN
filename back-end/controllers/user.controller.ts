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

  // Update an existing user
  async updateUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const updatedData = req.body;
    try {
      const updatedUser = await this._userService.updateUser(userId, updatedData);
      if (updatedUser) {
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

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE as string, 10),
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE as string, 10),
      });

      res.status(HttpStatus.OK).json({
        refreshToken,
        accessToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          mobile: user.mobile,
          gender: user.gender,
          isVerified: user.isVerified,
          imageUrl: user.imageUrl,
        },
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
}
