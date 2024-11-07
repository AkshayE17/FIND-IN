import User from "../models/User";
import { IUser } from "../models/User";
import { IUserRepository } from "../interfaces/users/IUserRepository";

class UserRepository implements IUserRepository {

  // Find user by ID
  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      console.error(`Error finding user with ID: ${id}`, error);
      throw new Error("Error finding user by ID");
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error(`Error finding user with email: ${email}`, error);
      throw new Error("Error finding user by email");
    }
  }

  // Create a new user
  async createUser(userData: IUser): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error("Error creating user", error);
      throw new Error("Error creating user");
    }
  }

  // Update user by ID
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
      console.error(`Error updating user with ID: ${id}`, error);
      throw new Error("Error updating user");
    }
  }

  // Find all users
  async findAllUsers(): Promise<IUser[]> {
    try {
      return await User.find();
    } catch (error) {
      console.error("Error finding all users", error);
      throw new Error("Error finding all users");
    }
  }
}

export default new UserRepository();
