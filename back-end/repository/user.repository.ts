import User, { IUser } from "../models/User";
import { IUserRepository } from "../interfaces/users/IUserRepository";
import { BaseRepository } from "./base.repository";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  // Find user by ID
  async findById(id: string): Promise<IUser | null> {
    try {
      return await this.findOne({ _id: id });
    } catch (error) {
      console.error(`Error finding user with ID: ${id}`, error);
      throw new Error("Error finding user by ID");
    }
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.findOne({ email });
    } catch (error) {
      console.error(`Error finding user with email: ${email}`, error);
      throw new Error("Error finding user by email");
    }
  }

  // Create a new user
  async createUser(userData: IUser): Promise<IUser> {
    try {
      return await this.create(userData); // Use BaseRepository's create method
    } catch (error) {
      console.error("Error creating user", error);
      throw new Error("Error creating user");
    }
  }

  // Update user by ID
  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await this.update(id, userData); // Use BaseRepository's update method
    } catch (error) {
      console.error(`Error updating user with ID: ${id}`, error);
      throw new Error("Error updating user");
    }
  }

  // Find all users
  async findAllUsers(): Promise<IUser[]> {
    try {
      return await this.findAll();
    } catch (error) {
      console.error("Error finding all users", error);
      throw new Error("Error finding all users");
    }
  }
}

export default new UserRepository();
