import { IUser } from "../models/User";
import bcrypt from "bcrypt";
import { generateOtp } from "../util/otp.util";
import { sendOtpEmail } from '../util/mail.util';
import { generateAccessToken, generateRefreshToken } from '../util/token.util';
import { UserRepository } from "../repository/user.repository";
import { OtpRepository } from "../repository/otp.repository";
import { hashPassword } from "../util/pass.util";


export class UserService {
    private userRepository: UserRepository;
    private otpRepository: OtpRepository;

    constructor(userRepository: UserRepository, otpRepository: OtpRepository) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
    }

    async registerUser(userData: IUser) {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        userData.password = await hashPassword(userData.password);

        // Generate OTP
        const otp = generateOtp();

        const newUser = await this.userRepository.createUser(userData);

        // Save OTP using otpRepository
        await this.otpRepository.createOtp(newUser.email.toString(), otp);

        // Send OTP email
        await sendOtpEmail(newUser.email.toString(), otp);

        return newUser;
    }

    async verifyOtp(email: string, otp: number) {
        const otpEntry = await this.otpRepository.findOtp(email, otp);
        if (!otpEntry) {
            throw new Error('Invalid OTP or OTP has expired.');
        }

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found.');
        }

        user.isVerified = true;
        await user.save();

        await this.otpRepository.deleteOtp(otpEntry.email);

        return user;
    }

    async loginUser(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.isVerified) {
            throw new Error('Please verify your email before logging in.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password.');
        }

        const accessToken = generateAccessToken(user._id as string);
        const refreshToken = generateRefreshToken(user._id as string);

        return { user, accessToken, refreshToken };
    }

    async updateUser(id: string, userData: Partial<IUser>) {
        const updatedUser = await this.userRepository.updateUser(id, userData);
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return updatedUser;
    }
}
