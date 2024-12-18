import { IUserService } from "../interfaces/users/IUserService";
import { IUser } from "../models/User";
import { IUserRepository } from "../interfaces/users/IUserRepository";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from '../util/token.util';
import { hashPassword } from "../util/pass.util";


export class UserService implements IUserService {

    constructor(private _userRepository: IUserRepository) {}

    async registerUser(userData: IUser) {
        try {
            const existingUser = await this._userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('User with this email already exists.');
            }


            userData.password = await hashPassword(userData.password);

            const newUser = await this._userRepository.createUser(userData);

            return newUser;
        }catch (error: unknown) {
                if (error instanceof Error) {
                  console.error("Error registering user:", error);
                  throw new Error(`Failed to register user: ${error.message}`);
                } else {
                  console.error("An unknown error occurred:", error);
                  throw error;
                }
              }
    }


    async getUserById(id: string) {
        try {
            const user = await this._userRepository.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            return user;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error getting user by ID:", error);
                throw new Error(`Failed to get user with ID ${id}: ${error.message}`);
            } else {
                console.error("An unknown error occurred:", error);
                throw error;
            }
        }   
    }

    async verifyOtp(email: string) {
        try {
            const user = await this._userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found.');
            }

            user.isVerified = true;
            await user.save();
            return user;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error verifying OTP:", error);
                throw new Error(`Failed to verify OTP for user with email ${email}: ${error.message}`);
            } else {
                console.error("An unknown error occurred:", error);
                throw error;
            }
        }
    }

    async loginUser(email: string, password: string) {
        try {
            const user = await this._userRepository.findByEmail(email);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.isVerified) {
                throw new Error('User is not verified.');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid password.');
            }

            if (user.isBlocked === true) {
                throw new Error('User is blocked');
            }

            const accessToken = generateAccessToken(user._id as string);
            const refreshToken = generateRefreshToken(user._id as string);

            return { user, accessToken, refreshToken };
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Error logging in user:", error);
                throw new Error(`Failed to log in user with email ${email}: ${error.message}`);
            } else {
                console.error("An unknown error occurred:", error);
                throw error;
            }
        }
    }


    async updateUser(id: string, userData: Partial<IUser>) {
        try {
            const updatedUser = await this._userRepository.updateUser(id, userData);
            if (!updatedUser) {
                throw new Error('User not found');
            }

            return updatedUser;
        }catch (error: unknown) {
            console.error("Error updating user:", error);
            throw new Error(`Failed to update user with ID ${id}: ${(error as Error).message}`);
        }
    }

    async changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
        try {
          const user = await this._userRepository.findById(id);
          console.log("user is : ", user);
          if (!user) {
            console.log("User not found.");
            throw new Error('User not found.');
          }
    
          console.log("current password is : ", currentPassword);
          console.log("recruiter password is : ", user.password);
      
          const isMatch = await bcrypt.compare(currentPassword, user.password);
          if (!isMatch) {
            console.log("Current password is incorrect.");
            throw new Error('Current password is incorrect.');
          }
      
          const hashedPassword = await hashPassword(newPassword);
          await this._userRepository.updateUserPassword(id, hashedPassword);
        } catch (error) {
          console.error('Error in changeRecruiterPassword service:', error);
          throw new Error(`Failed to change password: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      async checkMobileExists(mobile: string): Promise<boolean> {
        try {
          const recruiter = await this._userRepository.checkMobileExists(mobile);
          return recruiter;
        } catch (error) {
          console.error('Error in checkEmailExists service:', error);
          throw new Error(`Failed to check email: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
}
