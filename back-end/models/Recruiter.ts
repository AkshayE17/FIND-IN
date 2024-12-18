import { Schema, model, Document } from 'mongoose';

export interface IRecruiter extends Document {
  name: string;
  email: string;
  officialEmail: string;
  mobile: number;
  gender: string;
  companyName: string;
  companyWebsite: string;
  jobTitle: string;
  einNumber: string; 
  imageUrl: string;
  password: string;
  isVerified: boolean;
  isBlocked: boolean;
  isApproved:'Pending' | 'Approved' | 'Rejected';
}

export interface FilterOptions {
  company?: string;
  startDate?: string;
  endDate?: string;
  isBlocked?:boolean;
}

const recruiterSchema = new Schema<IRecruiter>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  officialEmail: { type: String, required: true},
  mobile: { type: Number, required: true,unique: true },
  gender: { type: String, required: true },
  companyName: { type: String, required: true },
  companyWebsite: { type: String, required: true },
  jobTitle: { type: String, required: true },
  einNumber: {type:String,required:true},
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isApproved:{ type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, 
  imageUrl: { type: String, default: 'assets/Recruiter.jpg' }
},{ timestamps: true });

export default model<IRecruiter>('Recruiter', recruiterSchema);
