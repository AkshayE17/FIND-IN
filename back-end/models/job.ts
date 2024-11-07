
import { Schema, model,Document,Types } from 'mongoose';
import { IRecruiter } from './Recruiter';
import { ICompany } from './company';

export interface IJob extends Document{
  companyId: Types.ObjectId; 
  recruiterId: Types.ObjectId; 
  jobTitle: string; 
  jobType: string;
  jobCategory: string; 
  jobDescription: string; 
  experienceRequired: string; 
  location: string; 
  salary: string;
  skills:string[];
  applicants: Types.ObjectId[];
  shortListed: Types.ObjectId[];
  recruiter:IRecruiter;  
  company:ICompany;

}

const jobSchema = new Schema<IJob>({
  companyId: { type: Schema.Types.ObjectId, required: true, ref: 'Company' },
  recruiterId: { type: Schema.Types.ObjectId, required: true, ref: 'Recruiter' },
  jobTitle: { type: String, required: true },
  jobType: { type: String, required: true },
  jobCategory: { type: String, required: true },
  jobDescription: { type: String, required: true },
  experienceRequired: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  skills:{ type:[String],required:true},
  applicants: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  shortListed:{ type: [Schema.Types.ObjectId], ref: 'User', default: [] },
},{ timestamps: true });

export const JobModel = model<IJob>('Job', jobSchema);