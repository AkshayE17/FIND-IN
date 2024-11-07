import { IUser } from "../../models/User";

export interface IUserService {
    registerUser(userData: IUser): Promise<IUser>;
    verifyOtp(email: string): Promise<IUser>;
    loginUser(email: string, password: string): Promise<{ user: IUser, accessToken: string, refreshToken: string }>;
    updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
}
