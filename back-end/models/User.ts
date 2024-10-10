import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: number;
  gender: string;
  imageUrl?: string; // Optional, but we will set a default
  password: string;
  isVerified?: boolean;
  isBlocked?: boolean;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: Number, required: true },
  gender: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  imageUrl: { type: String, default: 'assets/jobseeker.jpg' }
});

export default model<IUser>('User', userSchema);
