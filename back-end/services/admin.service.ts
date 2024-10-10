import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAdmin } from '../models/admin';
import { IRecruiter } from '../models/Recruiter';
import { IUser } from '../models/User';
import { AdminRepository } from '../repository/admin.repository';

const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret_key';

interface ILoginResponse {
  token: string;
  admin: IAdmin;
}

export class AdminService {
private adminRepo:AdminRepository;

  constructor() {
     this.adminRepo=new AdminRepository()
  }

  async login(email: string, password: string): Promise<ILoginResponse> {
    const admin = await this.adminRepo.findByEmail(email);
    if (!admin) {
      throw new Error('Admin not found.');
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, SECRET_KEY, { expiresIn: '1h' });

    return { token, admin };
  }

  async createAdmin(email: string, password: string): Promise<IAdmin> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await this.adminRepo.createAdmin({ email, password: hashedPassword });
    return admin;
  }

  async getPendingRecruiters(): Promise<IRecruiter[]> {
    return await this.adminRepo.findPendingRecruiters();
  }

  async getRecruiters(): Promise<IRecruiter[]> {
    return await this.adminRepo.getAllRecruiters();
  }

  async approveRecruiter(email: string): Promise<IRecruiter | null> {
    return this.adminRepo.updateRecruiterStatus(email, 'approved');
  }

  async rejectRecruiter(email: string): Promise<IRecruiter | null> {
    return this.adminRepo.updateRecruiterStatus(email, 'rejected');
  }

  async getAllUsers():Promise<IUser[]>{
    return this.adminRepo.getAllUsers();
  }
}
