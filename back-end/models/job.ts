
import { Schema, model,Document,Types, ObjectId } from 'mongoose';
import { IRecruiter } from './Recruiter';
import { ICompany } from './company';

export interface IApplicant {
  userId: Types.ObjectId;
  appliedDate: Date;
  applicationStatus: "applied" | "shortlisted" | "rejected";
  _id?:ObjectId | undefined;
}

export interface JobStatistics {
  totalJobs: number;
  totalApplicants: number;
  jobsByCategory: { category: string, count: number }[];
  applicantsBySkill: { skill: string, count: number }[];
}


export interface JobReportData {
  jobTitle: string;
  companyName: string;
  totalApplicants: number;
  averageSalary: number;
  topSkills: string[];
}

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
  applicants: IApplicant[];
  recruiter:IRecruiter;  
  company:ICompany;

}
const applicantSchema = new Schema<IApplicant>({
  userId: { type: Schema.Types.ObjectId, required: true },
  appliedDate: { type: Date, required: true },
  applicationStatus: { type: String, required: true, enum: ["applied", "shortlisted", "rejected"],default:"applied" },
});

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
  applicants: { type: [applicantSchema], ref: 'User', default: [] },
},{ timestamps: true });

export const JobModel = model<IJob>('Job', jobSchema);
