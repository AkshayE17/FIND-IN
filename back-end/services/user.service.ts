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
}
