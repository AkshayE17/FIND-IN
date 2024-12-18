import { IUser } from "../../models/User";

export interface IUserService {
    registerUser(userData: IUser): Promise<IUser>;
    getUserById(id: string): Promise<IUser>;
    verifyOtp(email: string): Promise<IUser>;
    loginUser(email: string, password: string): Promise<{ user: IUser, accessToken: string, refreshToken: string }>;
    updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
    changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<void>;
    checkMobileExists(mobile: string): Promise<boolean> 
}
