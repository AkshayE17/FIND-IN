import User from "../models/User";
import { IUser } from "../models/User";

export class UserRepository{

  async findUserById(id:string) :Promise<IUser | null>{
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async createUser(userData:IUser):Promise<IUser>{
    const user=new User(userData);
    return user.save();
  }

  async updateUser(id:string,userData:Partial<IUser>):Promise<IUser | null>{
    return User.findByIdAndUpdate(id,userData,{new:true})
  }


  async findAllUsers():Promise<IUser[]>{
    return User.find();
  }
   
}