import { Schema, model, Document,Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: number;
  gender: string;
  imageUrl?: string; 
  password: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  jobs?: Types.ObjectId[];
}
export interface UFilterOptions {
  gender?: string;
  startDate?: string;
  endDate?: string;
  isBlocked?:boolean;
}
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: Number, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  imageUrl: { type: String, default: 'assets/jobseeker.jpg' },
  jobs: { type: [Schema.Types.ObjectId], ref: 'Job', default: [] }
 },{ timestamps: true }
);

export default model<IUser>('User', userSchema);
