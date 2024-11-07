import {IUser} from '../../models/User'

export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    createUser(userData: IUser): Promise<IUser>;
    updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
    findAllUsers(): Promise<IUser[]>;
}
